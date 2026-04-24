import { MetadataRoute } from 'next'
import { supabase } from '@/app/lib/supabaseClient' // Importa il tuo client Supabase

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.extrajobs.app' // Sostituisci con il tuo dominio reale

  // 1. Pagine statiche
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // 2. Pagine dinamiche (i singoli annunci di lavoro)
  // Recuperiamo gli ID dei lavori dal database
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at')

  const jobEntries = (jobs || []).map((job) => ({
    url: `${baseUrl}/job/${job.id}`, // Assicurati che questo slug corrisponda alla tua rotta
    lastModified: new Date(job.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...jobEntries]
}