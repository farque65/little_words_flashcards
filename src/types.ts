export interface WordSound { label: string; say: string; audio: string | null }
export interface WordCard { id: string; word: string; category: string; picture: string; image: string | null; imageSource?: { provider: string; url: string; originalImageUrl: string; licenseUrl: string; description: string }; speech: string; audio: string | null; soundMode: 'phonemes' | 'syllables' | 'slow-word'; sounds: WordSound[] }
export interface WordCollection { version: number; language: string; items: WordCard[] }
