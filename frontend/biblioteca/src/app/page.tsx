import { Book } from "../../types/books";

// Busca direta no backend usando LINKAPI
async function getBooks(): Promise<Book[]> {
  const base = process.env.LINKAPI;
  if (!base) throw new Error('LINKAPI não configurado no .env.local');

  const res = await fetch(`${base}/books`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend respondeu ${res.status}. ${text}`);
  }

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
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/400/600`;
}

// Componente para estrelas de avaliação (placeholder)
function RatingStars({ rating = 4.5 }: { rating?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function Page() {
  const books = await getBooks();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Biblioteca Digital
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore nossa coleção de livros cuidadosamente selecionados. 
            Encontre sua próxima grande leitura entre milhares de títulos.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por título, autor ou palavra-chave..."
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {books.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Nenhum livro encontrado</h3>
            <p className="text-gray-600">Parece que nossa biblioteca está vazia no momento.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Nossa Coleção <span className="text-blue-600">({books.length} livros)</span>
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Ordenar
                </button>
                <button className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                    <img
                      src={coverFor(b.id)}
                      alt={b.title ?? 'Capa do livro'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-800 shadow-sm">
                      {b.page_count ? `${b.page_count} pág.` : '—'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {b.title ?? 'Sem título'}
                    </h3>
                    
                    <div className="flex items-center mb-3">
                      <RatingStars rating={4.5} />
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="line-clamp-1">{prettyAuthors(b.authors)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{b.pub_year ?? 'Ano não informado'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Ficção
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        Favoritar
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">1</button>
                <button className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">2</button>
                <button className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">3</button>
                <button className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Próximo
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </main>
  );
}