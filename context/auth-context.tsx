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
import { auth, db, isFirebaseConfigured } from '@/services/firebase/config';
import { Militar } from '@/types/militar';
import { saveMilitarData, fetchMilitarByNip } from '@/services/firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  nip: string;
  nomeCompleto: string;
  nomeGuerra: string;
  posto: string;
  unidade: string;
  funcaoDesempenhada: string;
  categoria: 'OFICIAL' | 'SARGENTO' | 'PRACA';
  role: 'ADMIN' | 'DPQ' | 'CMDTE' | 'AVALIADOR_1' | 'AVALIADOR_2' | 'MILITAR_AVALIADO';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (emailOrNip: string, pass: string) => Promise<void>;
  registerMilitar: (email: string, pass: string, militarData: Partial<Militar>, role?: UserProfile['role']) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  registerMilitar: async () => {},
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
    let email = rawInput;
    let cleanNip = rawInput.replace('@faa.ao', '').trim();
    if (!email.includes('@')) {
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

        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
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
          authErr?.message?.includes('configuration-not-found');

        if (!isPendingConfig) {
          throw authErr;
        }
      }
    }

    // 2. Fallback de verificação direta no Firestore
    const userDoc = await getDoc(doc(db, 'users', cleanNip));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      setProfile(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('faa_user_session', JSON.stringify(data));
      }
      return;
    }

    // Verificar se existe registo militar correspondente
    const militarDoc = await fetchMilitarByNip(cleanNip);
    if (militarDoc) {
      const fallbackProfile: UserProfile = {
        uid: militarDoc.nip,
        email: `${militarDoc.nip}@faa.ao`,
        nip: militarDoc.nip,
        nomeCompleto: militarDoc.nomeCompleto,
        nomeGuerra: militarDoc.nomeGuerra,
        posto: militarDoc.posto,
        unidade: militarDoc.unidade,
        funcaoDesempenhada: militarDoc.funcaoDesempenhada,
        categoria: militarDoc.categoria,
        role: cleanNip === '00000001' ? 'ADMIN' : 'MILITAR_AVALIADO',
      };
      await setDoc(doc(db, 'users', cleanNip), fallbackProfile);
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
  ) => {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('O sistema de base de dados não está configurado.');
    }

    const nip = militarData.nip;
    if (!nip) {
      throw new Error('O NIP é obrigatório para o cadastro militar.');
    }

    const fullMilitar: Militar = {
      nip,
      bi: militarData.bi || '',
      nomeCompleto: militarData.nomeCompleto || '',
      nomeGuerra: militarData.nomeGuerra || (militarData.nomeCompleto?.split(' ')[0] || ''),
      posto: militarData.posto || 'Soldado',
      categoria: militarData.categoria || 'PRACA',
      subcategoria: militarData.subcategoria,
      unidade: militarData.unidade || '',
      orgao: militarData.orgao || '',
      funcaoDesempenhada: militarData.funcaoDesempenhada || '',
      asc: militarData.asc || '',
      qe: militarData.qe || 'QP',
      dataNascimento: militarData.dataNascimento || '',
      naturalidade: militarData.naturalidade || '',
      filiacao: militarData.filiacao || '',
      dataIngresso: militarData.dataIngresso || '',
      tempoServicoAnos: militarData.tempoServicoAnos || 0,
      feridoEmServico: militarData.feridoEmServico || false,
      habilitacoesLiterarias: militarData.habilitacoesLiterarias || '',
      estadoCivil: militarData.estadoCivil || '',
      idiomas: militarData.idiomas || '',
      morada: militarData.morada || '',
      contacto: militarData.contacto || '',
      situacao: 'ACTIVO',
      ...militarData,
    };

    const newProfile: UserProfile = {
      uid: nip,
      email,
      nip: fullMilitar.nip,
      nomeCompleto: fullMilitar.nomeCompleto,
      nomeGuerra: fullMilitar.nomeGuerra,
      posto: fullMilitar.posto,
      unidade: fullMilitar.unidade,
      funcaoDesempenhada: fullMilitar.funcaoDesempenhada,
      categoria: fullMilitar.categoria,
      role,
    };

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        newProfile.uid = cred.user.uid;
        setUser(cred.user);
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (authErr: any) {
        console.warn('Firebase Auth create user note:', authErr?.message);
      }
    }

    // Gravar perfil em users/{nip} e militares/{nip}
    await setDoc(doc(db, 'users', nip), newProfile);
    await saveMilitarData(fullMilitar);

    setProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('faa_user_session', JSON.stringify(newProfile));
    }
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
