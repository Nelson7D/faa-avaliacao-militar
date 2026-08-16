'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/services/firebase/config';
import { Militar } from '@/types/militar';
import { fetchMilitarByNip, saveMilitarData } from '@/services/firebase/firestore';

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
    // Check saved local profile
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('faa_active_profile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
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
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              setProfile(data);
              localStorage.setItem('faa_active_profile', JSON.stringify(data));
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar perfil do Firestore:', err);
        }
      } else {
        setProfile(null);
        localStorage.removeItem('faa_active_profile');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrNip: string, pass: string) => {
    let email = emailOrNip.trim();
    let nipOrEmail = email;
    if (!email.includes('@')) {
      email = `${email.toLowerCase()}@faa.ao`;
    }

    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setUser(cred.user);
        if (db) {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            localStorage.setItem('faa_active_profile', JSON.stringify(data));
            return;
          }
        }
      } catch (authErr: any) {
        // Se Firebase Auth não tiver o provider de Email habilitado no console, busca no Firestore por NIP/Email
        if (
          authErr.code === 'auth/configuration-not-found' ||
          authErr.code === 'auth/operation-not-allowed' ||
          authErr.message?.includes('configuration-not-found')
        ) {
          if (db) {
            const militares = await fetchMilitares();
            const cleanIdentifier = nipOrEmail.replace('@faa.ao', '').trim();
            const militarFound = militares.find(
              (m) => m.nip === cleanIdentifier || m.contacto.includes(cleanIdentifier)
            );
            if (militarFound) {
              const fallbackProfile: UserProfile = {
                uid: militarFound.nip,
                email: `${militarFound.nip}@faa.ao`,
                nip: militarFound.nip,
                nomeCompleto: militarFound.nomeCompleto,
                nomeGuerra: militarFound.nomeGuerra,
                posto: militarFound.posto,
                unidade: militarFound.unidade,
                funcaoDesempenhada: militarFound.funcaoDesempenhada,
                categoria: militarFound.categoria,
                role: militarFound.posto.includes('General') || militarFound.posto.includes('Coronel') ? 'DPQ' : 'AVALIADOR_1',
              };
              setProfile(fallbackProfile);
              localStorage.setItem('faa_active_profile', JSON.stringify(fallbackProfile));
              return;
            }
          }
        }
        throw authErr;
      }
    } else {
      throw new Error('Firebase Authentication não está configurado.');
    }
  };

  const registerMilitar = async (
    email: string,
    pass: string,
    militarData: Partial<Militar>,
    role: UserProfile['role'] = 'MILITAR_AVALIADO'
  ) => {
    const nip = militarData.nip || `${Math.floor(10000000 + Math.random() * 90000000)}`;
    const fullMilitar: Militar = {
      nip,
      bi: militarData.bi || '000000000LA000',
      nomeCompleto: militarData.nomeCompleto || 'Militar Registado',
      nomeGuerra: militarData.nomeGuerra || (militarData.nomeCompleto?.split(' ')[0] || 'Militar'),
      posto: militarData.posto || 'Soldado',
      categoria: militarData.categoria || 'PRACA',
      subcategoria: militarData.categoria === 'OFICIAL' ? 'SUBALTERNO' : undefined,
      unidade: militarData.unidade || 'Quartel-General do Exército',
      orgao: militarData.orgao || 'Exército',
      funcaoDesempenhada: militarData.funcaoDesempenhada || 'Efetivo Militar',
      asc: militarData.asc || 'Infantaria',
      qe: 'QP',
      dataNascimento: '1995-01-01',
      naturalidade: 'Luanda, Angola',
      filiacao: 'Pai e Mãe',
      dataIngresso: '2018-01-01',
      tempoServicoAnos: 7,
      feridoEmServico: false,
      habilitacoesLiterarias: 'Ensino Médio',
      estadoCivil: 'Solteiro',
      idiomas: 'Português',
      morada: 'Luanda',
      contacto: '+244 900 000 000',
      situacao: 'ACTIVO',
      ...militarData,
    };

    // Salva o militar no Firestore
    await saveMilitarData(fullMilitar);

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

    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        newProfile.uid = cred.user.uid;
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        }
      } catch (authErr: any) {
        if (
          authErr.code === 'auth/configuration-not-found' ||
          authErr.code === 'auth/operation-not-allowed' ||
          authErr.message?.includes('configuration-not-found')
        ) {
          // Salva no Firestore sob users/{nip}
          if (db) {
            await setDoc(doc(db, 'users', nip), newProfile);
          }
        } else {
          throw authErr;
        }
      }
    }

    setProfile(newProfile);
    localStorage.setItem('faa_active_profile', JSON.stringify(newProfile));
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('faa_active_profile');
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
