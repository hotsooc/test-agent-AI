import { createContext, useContext } from 'react'

interface LanguageContextType {
  language: string
  isVi: boolean
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'vi-VN',
  isVi: true,
})

export const useLanguage = () => useContext(LanguageContext)
