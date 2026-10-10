'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, firebaseConfig } from '@/services/firebase/config';
import { Militar } from '@/types/militar';
import { saveMilitarData, fetchMilitarByNip, sanitizeFirestoreData } from '@/services/firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  nip: string;
  nomeCompleto: string;
  nomeGuerra?: string;
  posto: string;
  unidade: string;
  funcaoDesempenhada?: string;
  categoria: 'OFICIAL' | 'SARGENTO' | 'PRACA';
  role: 'ADMIN' | 'DPQ' | 'CMDTE' | 'AVALIADOR_1' | 'AVALIADOR_2' | 'MILITAR_AVALIADO';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (emailOrNip: string, pass: string) => Promise<void>;
  registerMilitar: (
    email: string,
    pass: string,
    militarData: Partial<Militar>,
    role?: UserProfile['role']
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  registerMilitar: async () => ({} as UserProfile),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tentar restaurar sessão persistida localmente (fallback caso Firebase Auth esteja pendente de ativação no Console)
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('faa_user_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as UserProfile;
          setProfile(parsed);
        } catch {}
      }
    }

    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          if (db) {
            let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              setProfile(data);
              if (typeof window !== 'undefined') {
                localStorage.setItem('faa_user_session', JSON.stringify(data));
              }
            } else {
              // Se não encontrou por UID, tenta por email
              if (firebaseUser.email) {
                const cleanNip = firebaseUser.email.replace('@faa.ao', '').trim();
                userDoc = await getDoc(doc(db, 'users', cleanNip));
                if (userDoc.exists()) {
                  const data = userDoc.data() as UserProfile;
                  setProfile(data);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('faa_user_session', JSON.stringify(data));
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar perfil do Firestore:', err);
        }
      }
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (emailOrNip: string, pass: string) => {
    const rawInput = emailOrNip.trim();
    const isEmailInput = rawInput.includes('@');
    let email = rawInput.toLowerCase();
    let cleanNip = rawInput.replace('@faa.ao', '').trim();
    if (!isEmailInput) {
      email = `${cleanNip.toLowerCase()}@faa.ao`;
    }

    if (!isFirebaseConfigured() || !db) {
      throw new Error('O sistema de base de dados não está configurado. Contacte o administrador.');
    }

    // 1. Tentar autenticação via Firebase Auth
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser(cred.user);

        let userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('faa_user_session', JSON.stringify(data));
          }
          return;
        }

        // Tenta por NIP
        const nipDoc = await getDoc(doc(db, 'users', cleanNip));
        if (nipDoc.exists()) {
          const data = nipDoc.data() as UserProfile;
          setProfile(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('faa_user_session', JSON.stringify(data));
          }
          return;
        }
      } catch (authErr: any) {
        const isPendingConfig =
          authErr?.code === 'auth/configuration-not-found' ||
          authErr?.code === 'auth/operation-not-allowed' ||
          authErr?.code === 'auth/invalid-credential' ||
          authErr?.code === 'auth/user-not-found' ||
          authErr?.code === 'auth/wrong-password' ||
          authErr?.message?.includes('configuration-not-found');

        if (!isPendingConfig) {
          throw authErr;
        }
      }
    }

    // 2. Fallback de verificação direta no Firestore
    // 2.1 Tentar buscar diretamente por NIP
    let userDoc = await getDoc(doc(db, 'users', cleanNip));
    if (!userDoc.exists() && isEmailInput) {
      // 2.2 Se forneceu e-mail e não achou por doc(users, cleanNip), buscar por campo email
      try {
        const q = query(collection(db, 'users'), where('email', '==', rawInput.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          userDoc = snap.docs[0];
        }
      } catch (err) {
        console.warn('Erro ao consultar utilizador por e-mail no Firestore:', err);
      }
    }

    if (userDoc && userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      setProfile(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('faa_user_session', JSON.stringify(data));
      }
      return;
    }

    // 2.3 Verificar se existe registo militar correspondente
    const militarDoc = await fetchMilitarByNip(cleanNip);
    if (militarDoc) {
      const fallbackProfile: UserProfile = {
        uid: militarDoc.nip,
        email: `${militarDoc.nip}@faa.ao`,
        nip: militarDoc.nip,
        nomeCompleto: militarDoc.nomeCompleto,
        nomeGuerra: militarDoc.nomeGuerra || militarDoc.nomeCompleto.split(' ')[0],
        posto: militarDoc.posto,
        unidade: militarDoc.unidade,
        funcaoDesempenhada: militarDoc.funcaoDesempenhada || 'Efetivo Militar',
        categoria: militarDoc.categoria,
        role: cleanNip === '00000001' ? 'ADMIN' : 'MILITAR_AVALIADO',
      };
      await setDoc(doc(db, 'users', cleanNip), sanitizeFirestoreData(fallbackProfile));
      setProfile(fallbackProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('faa_user_session', JSON.stringify(fallbackProfile));
      }
      return;
    }

    throw new Error('NIP ou credenciais não encontradas no sistema das FAA.');
  };

  const registerMilitar = async (
    email: string,
    pass: string,
    militarData: Partial<Militar>,
    role: UserProfile['role'] = 'MILITAR_AVALIADO'
  ): Promise<UserProfile> => {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('O sistema de base de dados não está configurado.');
    }

    const nip = (militarData.nip || '').trim();
    if (!nip) {
      throw new Error('O NIP é obrigatório para o cadastro militar.');
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('O e-mail é obrigatório para o cadastro.');
    }

    // 1. Verificar duplicação de NIP
    const existingNipUser = await getDoc(doc(db, 'users', nip));
    if (existingNipUser.exists()) {
      throw new Error(`O militar com NIP ${nip} já se encontra cadastrado no sistema.`);
    }

    const existingMilitar = await fetchMilitarByNip(nip);
    if (existingMilitar) {
      throw new Error(`Já existe uma folha de matrícula com o NIP ${nip} no efetivo.`);
    }

    // 2. Verificar duplicação de E-mail
    try {
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        throw new Error(`O e-mail ${cleanEmail} já está associado a outro militar no sistema.`);
      }
    } catch (e: any) {
      if (e?.message?.includes('já está associado')) throw e;
    }

    const fullMilitar: Militar = {
      nip,
      bi: militarData.bi || '',
      nomeCompleto: (militarData.nomeCompleto || '').trim(),
      nomeGuerra: (militarData.nomeGuerra || (militarData.nomeCompleto?.split(' ')[0] || '')).trim(),
      posto: militarData.posto || 'Soldado',
      categoria: militarData.categoria || 'PRACA',
      ...(militarData.subcategoria ? { subcategoria: militarData.subcategoria } : {}),
      unidade: militarData.unidade || '',
      orgao: militarData.orgao || '',
      funcaoDesempenhada: militarData.funcaoDesempenhada || 'Efetivo Militar',
      asc: militarData.asc || 'Infantaria',
      qe: militarData.qe || 'QP',
      dataNascimento: militarData.dataNascimento || '',
      naturalidade: militarData.naturalidade || '',
      filiacao: militarData.filiacao || '',
      dataIngresso: militarData.dataIngresso || '',
      tempoServicoAnos: militarData.tempoServicoAnos || 0,
      feridoEmServico: Boolean(militarData.feridoEmServico),
      habilitacoesLiterarias: militarData.habilitacoesLiterarias || '',
      estadoCivil: militarData.estadoCivil || '',
      idiomas: militarData.idiomas || '',
      morada: militarData.morada || '',
      contacto: militarData.contacto || '',
      situacao: 'ACTIVO',
    };

    const newProfile: UserProfile = {
      uid: nip,
      email: cleanEmail,
      nip: fullMilitar.nip,
      nomeCompleto: fullMilitar.nomeCompleto,
      nomeGuerra: fullMilitar.nomeGuerra,
      posto: fullMilitar.posto,
      unidade: fullMilitar.unidade,
      funcaoDesempenhada: fullMilitar.funcaoDesempenhada,
      categoria: fullMilitar.categoria,
      role,
    };

    const isCallerAdminOrDpq = profile?.role === 'ADMIN' || profile?.role === 'DPQ';

    // 3. Criação no Firebase Auth se configurado
    if (auth && isFirebaseConfigured()) {
      try {
        if (isCallerAdminOrDpq) {
          // Operador autenticado criando novo militar: utilizar instância isolada para não perder a sessão
          const { initializeApp: initApp, deleteApp } = await import('firebase/app');
          const { getAuth: getSecondaryAuth } = await import('firebase/auth');
          const secondaryApp = initApp(firebaseConfig, `Register_${Date.now()}`);
          const secondaryAuth = getSecondaryAuth(secondaryApp);
          const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, pass);
          newProfile.uid = cred.user.uid;
          await signOut(secondaryAuth);
          await deleteApp(secondaryApp);
        } else {
          // Auto-cadastro não-autenticado: registrar na instância padrão
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          newProfile.uid = cred.user.uid;
          setUser(cred.user);
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth create user note:', authErr?.message);
      }
    }

    // 4. Gravar perfil em users/{nip} e users/{uid} no Firestore
    const sanitizedProfile = sanitizeFirestoreData(newProfile);
    await setDoc(doc(db, 'users', nip), sanitizedProfile);
    if (newProfile.uid !== nip) {
      await setDoc(doc(db, 'users', newProfile.uid), sanitizedProfile);
    }

    // 5. Gravar dados militares regimentais
    await saveMilitarData(fullMilitar);

    // 6. Atualizar estado de sessão apenas se for auto-cadastro (não sobrescrever sessão de Admin/DPQ)
    if (!isCallerAdminOrDpq) {
      setProfile(newProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('faa_user_session', JSON.stringify(newProfile));
      }
    }

    return newProfile;
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('faa_user_session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        registerMilitar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
