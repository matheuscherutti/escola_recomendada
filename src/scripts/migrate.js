import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import https from 'https';

// Sobrescreve o dns.lookup global do Node.js para usar DNS-over-HTTPS da Cloudflare via IP direto (1.1.1.1)
// Isso contorna a lentidão ou timeouts do servidor DNS local (IPv6) do usuário.
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  console.log('dns.lookup:', hostname);
  if (hostname === 'ziwlgjipcfvkidsmvcqy.supabase.co') {
    https.get('https://1.1.1.1/dns-query?name=ziwlgjipcfvkidsmvcqy.supabase.co&type=A', {
      headers: { 'accept': 'application/dns-json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.Answer) {
            const ips = json.Answer.filter(ans => ans.type === 1).map(ans => ans.data);
            if (ips.length > 0) {
              console.log('Resolvido por DoH:', hostname, '->', ips);
              if (options.all) {
                callback(null, ips.map(ip => ({ address: ip, family: 4 })));
              } else {
                callback(null, ips[0], 4);
              }
            } else {
              originalLookup(hostname, options, callback);
            }
          } else {
            originalLookup(hostname, options, callback);
          }
        } catch (e) {
          originalLookup(hostname, options, callback);
        }
      });
    }).on('error', () => {
      originalLookup(hostname, options, callback);
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

// 1. Função para carregar o arquivo .env manualmente
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Arquivo .env não encontrado no diretório raiz!');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const config = {};
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      config[key] = val;
    }
  });
  return config;
}

const env = loadEnv();

// Credenciais Firebase
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Credenciais Supabase (lidas de variáveis de ambiente por segurança)
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ziwlgjipcfvkidsmvcqy.supabase.co';
// A chave de serviço deve ser definida na variável de ambiente SUPABASE_SERVICE_KEY
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

// Inicializar Clients
console.log('Conectando ao Firebase e Supabase com chaves administrativas...');
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function migrate() {
  try {
    // ---- 1. MIGRAÇÃO DE ESCOLAS ----
    console.log('\n--- Migrando Escolas ---');
    const schoolsSnap = await getDocs(collection(firestore, 'schools'));
    const schools = [];
    schoolsSnap.forEach(doc => {
      const data = doc.data();
      schools.push({
        id: doc.id,
        name: data.name,
        cnpj: data.cnpj || null,
        active: data.active !== undefined ? data.active : true,
        contact_name: data.contact_name || data.contactName || 'Contato',
        email: data.email || 'escola@teste.com',
        phone: data.phone || '',
        created_at: data.created_at || data.createdAt || new Date().toISOString()
      });
    });

    const schoolIds = new Set(schools.map(s => s.id));
    console.log(`Encontradas ${schools.length} escolas no Firestore.`);
    if (schools.length > 0) {
      const { error: errSch } = await supabase.from('schools').upsert(schools);
      if (errSch) throw new Error(`Erro ao migrar escolas: ${errSch.message}`);
      console.log('Escolas migradas com sucesso.');
    }

    // ---- 2. MIGRAÇÃO DE USUÁRIOS (AUTH + PUBLIC.USERS) ----
    console.log('\n--- Migrando Usuários (Autenticação e Perfis) ---');
    const usersSnap = await getDocs(collection(firestore, 'users'));
    const firestoreUsers = [];
    usersSnap.forEach(doc => {
      firestoreUsers.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Encontrados ${firestoreUsers.length} usuários no Firestore.`);

    const userMap = {}; // Mapeamento oldId -> newUuid

    for (const u of firestoreUsers) {
      const email = u.email;
      const password = u.password || 'crpazul1234*';
      const targetSchoolId = u.school_id || u.schoolId || null;
      // Garante integridade referencial com a escola
      const finalSchoolId = targetSchoolId && schoolIds.has(targetSchoolId) ? targetSchoolId : null;

      console.log(`Cadastrando usuário ${email}...`);

      // Como usamos a chave de serviço administrativa, podemos usar a API de Admin do Supabase
      // O método admin.createUser cria e confirma o usuário automaticamente sem rate limits ou envio de e-mails!
      const { data: adminUserData, error: adminUserErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: u.username || email.split('@')[0],
          name: u.name || 'Usuário',
          role: u.role || 'school_admin',
          school_id: finalSchoolId
        }
      });

      if (adminUserErr) {
        // Se já existir, busca o UUID do usuário cadastrado na tabela pública pelo e-mail
        if (adminUserErr.message.includes('already registered') || adminUserErr.message.includes('exists')) {
          console.log(`Usuário ${email} já cadastrado no Auth. Localizando UUID...`);
          const { data: usersList, error: findErr } = await supabase
            .from('users')
            .select('id')
            .eq('email', email);

          if (findErr) {
            console.error(`Erro ao localizar UUID de ${email}:`, findErr.message);
            continue;
          }
          if (usersList && usersList.length > 0) {
            userMap[u.id] = usersList[0].id;
            console.log(`UUID localizado para ${email}: ${usersList[0].id}`);
          } else {
            console.error(`Nenhum perfil público encontrado para ${email}`);
          }
        } else {
          console.error(`Erro ao criar usuário ${email}:`, adminUserErr.message);
        }
      } else if (adminUserData?.user) {
        userMap[u.id] = adminUserData.user.id;
        console.log(`Usuário ${email} criado e confirmado com sucesso. UUID: ${adminUserData.user.id}`);
      }
    }

    // ---- 3. MIGRAÇÃO DE CANDIDATOS ----
    console.log('\n--- Migrando Candidatos ---');
    const candidatesSnap = await getDocs(collection(firestore, 'candidates'));
    const candidates = [];
    candidatesSnap.forEach(doc => {
      const data = doc.data();
      
      // Mapeia o validador para o novo UUID
      const oldValidatorId = data.validated_by || data.validatedBy;
      const newValidatorId = oldValidatorId ? (userMap[oldValidatorId] || null) : null;

      candidates.push({
        id: doc.id,
        re: data.re,
        name: data.name,
        anac: data.anac,
        school_id: data.school_id || data.schoolId,
        status: data.status,
        selection_status: data.selection_status || data.selectionStatus || 'in_selection',
        gupy_status: data.gupy_status || data.gupyStatus || 'not_gupy',
        validated_by: newValidatorId,
        validated_at: data.validated_at || data.validatedAt || null,
        rejected_at: data.rejected_at || data.rejectedAt || null,
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        updated_at: data.updated_at || data.updatedAt || new Date().toISOString()
      });
    });

    const candidateIds = new Set(candidates.map(c => c.id));
    console.log(`Encontrados ${candidates.length} candidatos no Firestore.`);
    
    // Filtra candidatos para garantir integridade referencial com escolas cadastradas
    const validCandidates = candidates.filter(c => schoolIds.has(c.school_id));
    console.log(`Filtrados ${validCandidates.length} candidatos válidos vinculados a escolas existentes.`);

    if (validCandidates.length > 0) {
      const { error: errCand } = await supabase.from('candidates').upsert(validCandidates);
      if (errCand) throw new Error(`Erro ao migrar candidatos: ${errCand.message}`);
      console.log('Candidatos migrados com sucesso.');
    }

    // ---- 4. MIGRAÇÃO DE PROGRESSO DE MÓDULOS ----
    console.log('\n--- Migrando Progresso de Módulos ---');
    const progressSnap = await getDocs(collection(firestore, 'candidate_module_progress'));
    const progressRecords = [];
    progressSnap.forEach(doc => {
      const data = doc.data();
      const oldUpdaterId = data.updated_by || data.updatedBy;
      const newUpdaterId = oldUpdaterId ? (userMap[oldUpdaterId] || null) : null;

      progressRecords.push({
        id: doc.id,
        candidate_id: data.candidate_id || data.candidateId,
        module_code: data.module_code || data.moduleCode,
        status: data.status,
        completion_date: data.completion_date || data.completionDate || null,
        school_id: data.school_id || data.schoolId || null,
        certificate_url: data.certificate_url || data.certificateUrl || null,
        class_sheets: data.class_sheets || data.classSheets || null,
        uploaded_at: data.uploaded_at || data.uploadedAt || null,
        rejection_reason: data.rejection_reason || data.rejectionReason || null,
        updated_by: newUpdaterId,
        updated_at: data.updated_at || data.updatedAt || new Date().toISOString()
      });
    });

    console.log(`Encontrados ${progressRecords.length} registros de progresso no Firestore.`);
    
    // Filtragem crítica para evitar violação de integridade referencial com candidatos inexistentes (órfãos)
    const validProgress = progressRecords.filter(p => candidateIds.has(p.candidate_id));
    console.log(`Filtrados ${validProgress.length} registros de progresso vinculados a candidatos existentes.`);

    if (validProgress.length > 0) {
      const { error: errProg } = await supabase.from('candidate_module_progress').upsert(validProgress);
      if (errProg) throw new Error(`Erro ao migrar progresso: ${errProg.message}`);
      console.log('Progresso de módulos migrado com sucesso.');
    }

    // ---- 5. MIGRAÇÃO DE LOGS DE AUDITORIA ----
    console.log('\n--- Migrando Logs de Auditoria ---');
    const logsSnap = await getDocs(collection(firestore, 'audit_logs'));
    const logs = [];
    logsSnap.forEach(doc => {
      const data = doc.data();
      const oldUserId = data.user_id || data.userId;
      const newUserId = oldUserId ? (userMap[oldUserId] || null) : null;

      logs.push({
        id: doc.id,
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        user_id: newUserId,
        user_name: data.user_name || data.userName || null,
        candidate_id: data.candidate_id || data.candidateId || '-',
        candidate_name: data.candidate_name || data.candidateName || null,
        changed_field: data.changed_field || data.changedField,
        old_value: data.old_value !== undefined ? String(data.old_value) : null,
        new_value: data.new_value !== undefined ? String(data.new_value) : null
      });
    });

    console.log(`Encontrados ${logs.length} logs de auditoria no Firestore.`);
    
    // Filtragem de logs de auditoria órfãos
    const validLogs = logs.filter(l => l.candidate_id === '-' || candidateIds.has(l.candidate_id));
    console.log(`Filtrados ${validLogs.length} logs de auditoria vinculados a candidatos existentes.`);

    if (validLogs.length > 0) {
      const { error: errLogs } = await supabase.from('audit_logs').upsert(validLogs);
      if (errLogs) throw new Error(`Erro ao migrar logs de auditoria: ${errLogs.message}`);
      console.log('Logs de auditoria migrados com sucesso.');
    }

    // ---- 6. MIGRAÇÃO DE NOTIFICAÇÕES ----
    console.log('\n--- Migrando Notificações ---');
    const notifsSnap = await getDocs(collection(firestore, 'notifications'));
    const notifications = [];
    notifsSnap.forEach(doc => {
      const data = doc.data();
      const oldRecipientId = data.recipient_user_id || data.recipientUserId;
      const newRecipientId = oldRecipientId ? (userMap[oldRecipientId] || null) : null;

      notifications.push({
        id: doc.id,
        recipient_user_id: newRecipientId,
        recipient_school_id: data.recipient_school_id || data.recipientSchoolId || null,
        recipient_role: data.recipient_role || data.recipientRole || null,
        title: data.title,
        message: data.message,
        type: data.type,
        candidate_id: data.candidate_id || data.candidateId || null,
        is_read: data.is_read !== undefined ? data.is_read : (data.isRead !== undefined ? data.isRead : false),
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        read_at: data.read_at || data.readAt || null
      });
    });

    console.log(`Encontradas ${notifications.length} notificações no Firestore.`);
    
    // Filtragem de notificações órfãs
    const validNotifications = notifications.filter(n => !n.candidate_id || candidateIds.has(n.candidate_id));
    console.log(`Filtradas ${validNotifications.length} notificações vinculadas a candidatos existentes.`);

    if (validNotifications.length > 0) {
      const { error: errNotif } = await supabase.from('notifications').upsert(validNotifications);
      if (errNotif) throw new Error(`Erro ao migrar notificações: ${errNotif.message}`);
      console.log('Notificações migradas com sucesso.');
    }

    console.log('\n=============================================');
    console.log('MIGRAÇÃO DE DADOS CONCLUÍDA COM SUCESSO! 🎉');
    console.log('=============================================');
  } catch (err) {
    console.error('\n❌ Erro durante o processo de migração:', err);
    if (err.cause) {
      console.error('Causa do erro:', err.cause);
    }
    process.exit(1);
  }
}

migrate();
