export type Book = {
  id: string;
  title: string | null;
  page_count: number | null;
  pub_year: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  authors: string[];
};
