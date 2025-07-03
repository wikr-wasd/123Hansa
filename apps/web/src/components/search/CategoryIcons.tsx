import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Globe,
  FileText,
  MapPin,
  Briefcase,
  ShoppingCart,
  Users,
  TrendingUp
} from 'lucide-react';

interface CategoryIconsProps {
  className?: string;
  showLabels?: boolean;
}

const CATEGORY_ICONS = [
  {
    id: 'companies',
    name: 'Företag',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    description: 'Aktiebolag, HB, firmor'
  },
  {
    id: 'ecommerce',
    name: 'E-handel',
    icon: ShoppingCart,
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    description: 'Webshops, e-handel'
  },
  {
    id: 'domains',
    name: 'Domäner',
    icon: Globe,
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    description: 'Premium domäner'
  },
  {
    id: 'content',
    name: 'Content',
    icon: FileText,
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    description: 'Bloggar, YouTube'
  },
  {
    id: 'social',
    name: 'Social',
    icon: Users,
    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    description: 'Instagram, TikTok'
  },
  {
    id: 'affiliate',
    name: 'Affiliate',
    icon: TrendingUp,
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    description: 'Passiv inkomst'
  },
  {
    id: 'properties',
    name: 'Lokaler',
    icon: MapPin,
    color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    description: 'Kontor, butiker'
  },
  {
    id: 'services',
    name: 'Tjänster',
    icon: Briefcase,
    color: 'bg-red-50 text-red-600 hover:bg-red-100',
    description: 'Franchise, avtal'
  }
];

const CategoryIcons: React.FC<CategoryIconsProps> = ({
  className = '',
  showLabels = true
}) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/listings?category=${categoryId}`);
  };

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {CATEGORY_ICONS.map((category) => {
        const IconComponent = category.icon;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 group ${category.color} min-w-[80px]`}
            title={category.description}
          >
            <IconComponent className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
            {showLabels && (
              <span className="text-xs font-medium text-center leading-tight">
                {category.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryIcons;