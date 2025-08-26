import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories } from "@/data/labTests";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  const categories = getCategories();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Select Test Category
      </label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full bg-card border-medical-blue/20 focus:ring-medical-blue">
          <SelectValue placeholder="Choose a test category..." />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};