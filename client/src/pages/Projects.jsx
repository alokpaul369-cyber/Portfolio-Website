import { SearchX } from 'lucide-react';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectGrid from '@/components/projects/ProjectGrid';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Pagination from '@/components/ui/Pagination';
import { projectCategories } from '@/data/projects';
import useApiQuery from '@/hooks/useApiQuery';
import Seo from '@/components/seo/Seo';
import useListParams from '@/hooks/useListParams';

const PAGE_SIZE = 9;
const validCategories = new Set(projectCategories.map((category) => category.key));

/**
 * Projects page: category filters, search, results grid and pagination.
 * Filter, search and page live in the URL (?category=&q=&page=).
 */
export default function Projects() {
  const { get, page, update } = useListParams();

  const category = validCategories.has(get('category')) ? get('category') : '';
  const search = get('q');

  const params = { limit: PAGE_SIZE, page };
  if (category) params.category = category;
  if (search) params.search = search;

  const { data: projects, pagination, isLoading, error, retry } = useApiQuery('/projects', params);

  const hasFilters = Boolean(category || search);
  const total = pagination?.total ?? 0;

  return (
    <section className="container-page py-20 sm:py-28">
      <Seo
        title="Projects"
        description="Projects by Alok Paul: REST APIs with JWT authentication, full-stack MERN applications, a Java desktop app, an AI web app and C++ data structures and algorithms practice."
        path="/projects"
      />
      <PageHeader
        label="Projects"
        title="Selected projects"
        description="Applications, APIs and practice work I have designed and built. Each project links to its source code."
      />

      <div className="mt-12">
        <ProjectFilters
          category={category}
          search={search}
          onCategoryChange={(key) => update({ category: key })}
          onSearchChange={(term) => update({ q: term })}
        />
      </div>

      <p className="mt-6 min-h-5 text-sm text-muted" aria-live="polite">
        {!isLoading &&
          !error &&
          `${total} ${total === 1 ? 'project' : 'projects'}${hasFilters ? ' found' : ''}`}
      </p>

      <div className="mt-4">
        {error ? (
          <LoadError message={error} onRetry={retry} />
        ) : !isLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <SearchX className="size-6 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-medium">No projects match your filters</p>
            <p className="text-sm text-muted">Try a different category or search term.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => update({ category: '', q: '' })}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ProjectGrid projects={projects} isLoading={isLoading} headingLevel="h2" />
        )}
      </div>

      <Pagination
        label="Project pages"
        pagination={pagination}
        onPageChange={(next) => update({ page: next })}
      />
    </section>
  );
}
