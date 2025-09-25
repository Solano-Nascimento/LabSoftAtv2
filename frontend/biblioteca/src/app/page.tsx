import { Book } from "../../types/books";

// Busca direta no backend usando LINKAPI
async function getBooks(): Promise<Book[]> {
  const base = process.env.LINKAPI;
  if (!base) throw new Error('LINKAPI não configurado no .env.local');

  const res = await fetch(`${base}/books`, {
    // Em dev, evite cache para ver mudanças imediatamente:
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend respondeu ${res.status}. ${text}`);
  }

  // opcional: sanitizar/formatar
  const data = (await res.json()) as any[];
  return data.map((b) => ({
    id: String(b.id),
    title: b.title ?? null,
    page_count: b.page_count ?? null,
    pub_year: b.pub_year ?? null,
    authors: Array.isArray(b.authors) ? b.authors : [],
  }));
}

function prettyAuthors(authors: string[]) {
  return authors?.length ? authors.join(', ') : 'Autor(es) não informados';
}

function coverFor(id: string) {
  // imagem “aleatória” estável por ID
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/400/600`;
}

export default async function Page() {
  const books = await getBooks();

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
          <p className="text-gray-600">Lista de livros cadastrados</p>
        </header>

        {books.length === 0 ? (
          <div className="text-gray-600">Nenhum livro cadastrado ainda.</div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {books.map((b) => (
              <li
                key={b.id}
                className="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={coverFor(b.id)}
                    alt={b.title ?? 'Capa do livro'}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold">
                    {b.title ?? 'Sem título'}
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-800">Autor(es):</span>{' '}
                      {prettyAuthors(b.authors)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Páginas:</span>{' '}
                      {b.page_count ?? '—'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Ano:</span>{' '}
                      {b.pub_year ?? '—'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
