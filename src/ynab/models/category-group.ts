import { Category } from "./category";

export interface CategoryGroup {
  name: string;
  id: string;
  hidden: boolean;
  deleted: boolean;
  categories: Category[];
}
