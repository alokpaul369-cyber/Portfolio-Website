import FilterButton from '@/components/ui/FilterButton';
import SearchInput from '@/components/ui/SearchInput';
import { projectCategories } from '@/data/projects';

/**
 * Category filter buttons and a debounced search field for the Projects page.
 *
 * @param {object} props
 * @param {string} props.category       active category key, or '' for All
 * @param {string} props.search         committed search term (from the URL)
 * @param {(key: string) => void} props.onCategoryChange
 * @param {(term: string) => void} props.onSearchChange
 */
export default function ProjectFilters({ category, search, onCategoryChange, onSearchChange }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        <FilterButton active={!category} onClick={() => onCategoryChange('')}>
          All
        </FilterButton>
        {projectCategories.map(({ key, label }) => (
          <FilterButton key={key} active={category === key} onClick={() => onCategoryChange(key)}>
            {label}
          </FilterButton>
        ))}
      </div>

      <SearchInput
        value={search}
        onChange={onSearchChange}
        label="Search projects"
        placeholder="Search by name or technology"
        className="w-full md:w-64 md:shrink-0 lg:w-72"
      />
    </div>
  );
}
