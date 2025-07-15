import { useData } from '../contexts/DataContext'

export const useSettings = () => {
  const { settings, setSettings } = useData()

  return { settings, setSettings }
}

