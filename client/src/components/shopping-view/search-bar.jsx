import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { getSearchResults, resetSearchResults } from "@/store/shop/search-slice";

function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.shopSearch);

  // Handle search input changes
  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        dispatch(getSearchResults(keyword));
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsSearching(false);
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch]);

  // Reset searching state when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
      navigate(`/shop/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  // Clear search input
  const handleClearSearch = () => {
    setKeyword("");
  };

  // Toggle search bar expansion
  const toggleSearchBar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus the input when expanded
      setTimeout(() => {
        document.getElementById("header-search-input")?.focus();
      }, 100);
    }
  };

  return (
    <div className="relative">
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
              <Search size={18} />
            </div>
            <Input
              id="header-search-input"
              value={keyword}
              name="keyword"
              onChange={(event) => setKeyword(event.target.value)}
              className="pl-10 pr-10 py-2 h-10 w-full border-primary/30 focus-visible:ring-primary"
              placeholder="Rechercher des produits..."
            />
            {keyword && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                {isSearching || isLoading ? (
                  <Loader2 className="animate-spin text-primary" size={18} />
                ) : (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-primary focus:outline-none transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSearchBar}
            className="ml-2 text-gray-400 hover:text-primary focus:outline-none transition-colors"
          >
            <X size={20} />
          </button>
        </form>
      ) : (
        <button
          onClick={toggleSearchBar}
          className="flex items-center justify-center w-10 h-10 rounded-md border border-input bg-background hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Search size={20} />
          <span className="sr-only">Rechercher</span>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
