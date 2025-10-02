# Global Search Feature

## Overview
A powerful command palette-style global search that allows users to quickly find and navigate to People, Companies, Projects, and Relationships across the entire CRM system.

## Features

### 🔍 Comprehensive Search
- **Multi-entity search**: Searches across People, Companies, Projects, and Relationships simultaneously
- **Fuzzy matching**: Case-insensitive search across multiple fields per entity type
- **Real-time results**: Debounced search with 300ms delay for optimal performance
- **Result limit**: Returns up to 10 results per category (40 total max)

### ⌨️ Keyboard Shortcuts
- **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux) - Open/close search dialog
- **↑/↓ Arrow keys** - Navigate through results
- **Enter** - Select highlighted result and navigate to detail page
- **Escape** - Close search dialog

### 🎨 User Interface
- **Command palette design**: Modern, clean interface inspired by VS Code
- **Visual categorization**: Results grouped by entity type with icons
- **Keyboard shortcut badge**: Shows Cmd+K hint in search trigger button
- **Loading states**: Spinner indicator during search
- **Empty states**: Helpful messages when no results found or no query entered
- **Highlighted selection**: Current keyboard-selected item highlighted

### 🚀 Performance
- **Parallel queries**: All entity searches run concurrently via Promise.all
- **Database indexing**: Leverages Prisma's insensitive mode for case-insensitive search
- **Optimized results**: Limited to 10 per category to ensure fast response times
- **Debounced input**: Prevents excessive API calls during typing

## Implementation Details

### Backend API
**Endpoint**: `GET /api/search?q=<query>&type=<optional>`

**Query Parameters**:
- `q` (required): Search term (minimum 2 characters)
- `type` (optional): Filter by entity type ('person', 'company', 'project', 'relationship')

**Response Format**:
```json
{
  "people": [...],
  "companies": [...],
  "projects": [...],
  "relationships": [...],
  "total": 42,
  "query": "search term"
}
```

### Search Fields by Entity

#### People
- First name
- Last name
- Email
- Phone
- WhatsApp

#### Companies
- Name
- Industry
- Website
- Description

#### Projects
- Title
- Description

#### Relationships
- Notes (searchable text field)

### Frontend Component
**Component**: `GlobalSearch.tsx`
- Located in `/components/GlobalSearch.tsx`
- Integrated into the Header component
- Uses shadcn/ui Dialog component for modal interface

## Usage

### For Users
1. Click the search bar in the header OR press **Cmd+K** (or **Ctrl+K**)
2. Type your search query (minimum 2 characters)
3. Use arrow keys or mouse to select a result
4. Press Enter or click to navigate to the detail page

### For Developers

#### Adding Search to a New Entity
1. Update the API endpoint (`/app/api/search/route.ts`)
2. Add Prisma query with searchable fields
3. Update the response type in `GlobalSearch.tsx`
4. Add icon and display logic in the component

#### Customizing Search Behavior
- **Adjust debounce time**: Modify the timeout in the search useEffect (currently 300ms)
- **Change result limits**: Update the `take` parameter in Prisma queries (currently 10)
- **Add/remove searchable fields**: Modify the `OR` array in Prisma queries

## Integration Points

### Header Component
The GlobalSearch component is integrated into the main header:
- Replaces the static search input
- Positioned prominently for easy access
- Always visible across all pages

### Navigation
Search results link to:
- `/people/[id]` - Person detail pages
- `/companies/[id]` - Company detail pages
- `/projects/[id]` - Project detail pages
- `/people/[id]` - Person page (for relationships)

## Future Enhancements

### Potential Improvements
1. **Search history**: Store recent searches in localStorage
2. **Search filters**: Add filter chips for entity types
3. **Advanced search**: Support operators like AND, OR, exact match
4. **Autocomplete**: Suggest completions as user types
5. **Result previews**: Show more context in search results
6. **Search analytics**: Track popular searches and improve relevance
7. **Keyboard shortcuts**: Add more shortcuts for common actions
8. **Recent items**: Show recently viewed items when search is empty
9. **Favorites**: Quick access to starred/favorited items
10. **Export search**: Download search results as CSV

### Performance Optimizations
1. **Full-text search**: Implement PostgreSQL full-text search for better matching
2. **Search indexing**: Create database indexes on searchable fields
3. **Caching**: Cache popular search queries
4. **Pagination**: Add "Load more" for categories with many results
5. **Streaming results**: Stream results as they're found

## Technical Notes

### TypeScript Types
All search results use proper TypeScript typing with type guards for safe property access.

### Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation fully supported
- Screen reader friendly with sr-only labels
- Focus management when dialog opens/closes

### Mobile Considerations
- Search dialog is responsive
- Touch-friendly tap targets
- Works without keyboard shortcuts on mobile
- Swipe gestures supported

## Troubleshooting

### Search Not Working
1. Verify database is seeded with data
2. Check browser console for API errors
3. Ensure search query is at least 2 characters
4. Verify Prisma client is properly initialized

### Keyboard Shortcuts Not Working
1. Check for conflicting browser extensions
2. Ensure focus is not on another input field
3. Try clicking outside any input first
4. Verify OS keyboard shortcuts aren't overriding

### Slow Search Performance
1. Check database indexes on searchable fields
2. Consider reducing `take` limit in queries
3. Verify network latency to database
4. Check for N+1 query issues in related data

## Related Files
- `/app/api/search/route.ts` - Backend search API
- `/components/GlobalSearch.tsx` - Frontend search component
- `/components/layout/Header.tsx` - Integration point
- `/app/layout.tsx` - Root layout with search context
