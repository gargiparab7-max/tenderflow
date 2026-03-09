import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TenderCard } from '../components/TenderCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Search, SlidersHorizontal, Package, X } from 'lucide-react';
import { toast } from 'sonner';

export const Marketplace = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTenders = async () => {
    try {
      const params = {
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        status: 'active',
      };
      const response = await api.get('/tenders', { params });
      const tenderData = Array.isArray(response.data) ? response.data : [];
      setTenders(tenderData);

      // Extract unique categories
      const uniqueCategories = [...new Set(tenderData.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Failed to load tenders');
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute displayed tenders by applying sorting & local price filter
  const displayedTenders = tenders
    .filter((t) => (t.price || 0) <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  const handleSearch = () => {
    setLoading(true);
    fetchTenders();
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value === 'all' ? '' : value);
    setLoading(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setSortBy('newest');
    setMaxPrice(1000000);
    setLoading(true);
    setTimeout(() => fetchTenders(), 0);
  };

  const hasActiveFilters = searchQuery || categoryFilter || sortBy !== 'newest' || maxPrice < 1000000;

  useEffect(() => {
    if (categoryFilter !== null) {
      fetchTenders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-background py-10" data-testid="marketplace-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h1 className="font-manrope font-bold text-4xl text-foreground" data-testid="marketplace-title">
                Marketplace
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-15">
              Discover and order from available tenders
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-11 text-base shadow-sm bg-white pr-10"
                data-testid="marketplace-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setLoading(true); setTimeout(() => fetchTenders(), 0); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={`h-11 gap-2 font-semibold border-border ${showFilters ? 'bg-accent/10 border-accent text-accent' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8 border-border shadow-md animate-in slide-in-from-top-2 duration-200">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Category</Label>
                  <Select value={categoryFilter || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-11 text-base shadow-sm bg-white" data-testid="marketplace-category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-11 text-base shadow-sm bg-white">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Featured / Newest</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Max Price</Label>
                    <span className="text-sm font-bold text-accent">
                      {maxPrice >= 1000000 ? 'Any' : `₹${(maxPrice / 1000).toFixed(0)}k`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-accent gap-1.5 text-xs font-bold">
                    <X className="h-3.5 w-3.5" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-20" data-testid="marketplace-loading">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping" />
              <div className="relative h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-accent" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium">Loading tenders...</p>
          </div>
        ) : displayedTenders.length === 0 ? (
          <div className="text-center py-20" data-testid="marketplace-no-results">
            <div className="inline-block text-center">
              <div className="h-20 w-20 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-xl font-semibold mb-2">No tenders found</p>
              <p className="text-muted-foreground/70 text-sm mb-6">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{displayedTenders.length}</span> tender{displayedTenders.length !== 1 ? 's' : ''}
                {tenders.length !== displayedTenders.length && <span> of {tenders.length}</span>}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="marketplace-tender-grid">
              {displayedTenders.map((tender) => (
                <TenderCard key={tender.tender_id} tender={tender} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
