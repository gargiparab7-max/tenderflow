import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Weight, ArrowRight, Tag } from 'lucide-react';
import { SafeImage } from './SafeImage';

export const TenderCard = ({ tender }) => {
  const hasDiscount = tender.bulk_discount_tiers && tender.bulk_discount_tiers.length > 0;

  return (
    <Card className="hover:border-accent/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden group" data-testid={`tender-card-${tender.tender_id}`}>
      {/* Image Section */}
      <CardHeader className="p-0 overflow-hidden flex-shrink-0 relative">
        <SafeImage
          src={tender.image_url}
          alt={tender.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          fallbackSize={16}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex gap-2">
          {tender.category && (
            <Badge className="bg-white/95 text-foreground border-0 font-semibold text-xs shadow-sm backdrop-blur-sm">
              {tender.category}
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-green-500 text-white border-0 font-semibold text-xs shadow-sm">
              <Tag className="h-3 w-3 mr-1" />
              Bulk Deal
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <CardTitle className="font-manrope text-lg font-bold mb-2 line-clamp-2 text-foreground group-hover:text-accent transition-colors duration-200">
          {tender.title}
        </CardTitle>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {tender.description}
        </p>

        {/* Metadata Row */}
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Price - Highlight */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price/unit</span>
            <span className="font-manrope font-bold text-xl text-accent">₹{(tender.price || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Weight & Deadline */}
          <div className="flex items-center gap-4 flex-wrap">
            {tender.weight && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Weight className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{tender.weight}</span>
              </div>
            )}
            {tender.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{new Date(tender.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            )}
            {tender.min_order_qty > 1 && (
              <div className="text-xs font-medium text-muted-foreground">
                Min: <span className="text-foreground">{tender.min_order_qty} units</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer - Action Button */}
      <CardFooter className="p-5 pt-0">
        <Link to={`/tender/${tender.tender_id}`} className="w-full">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md group/btn" data-testid={`view-tender-${tender.tender_id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
