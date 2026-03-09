import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';

export const SkeletonCard = () => (
  <Card className="border-border shadow-md overflow-hidden">
    <CardHeader className="p-0">
      <div className="w-full h-48 bg-secondary/50 animate-pulse"></div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">
      <div className="h-4 bg-secondary/50 rounded w-1/3 animate-pulse"></div>
      <div className="h-6 bg-secondary/50 rounded w-2/3 animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-3 bg-secondary/50 rounded w-full animate-pulse"></div>
        <div className="h-3 bg-secondary/50 rounded w-5/6 animate-pulse"></div>
      </div>
      <div className="pt-3 space-y-3">
        <div className="h-4 bg-secondary/50 rounded w-1/2 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-4 bg-secondary/50 rounded animate-pulse"></div>
          <div className="h-4 bg-secondary/50 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="h-10 bg-secondary/50 rounded w-full animate-pulse mt-4"></div>
    </CardContent>
  </Card>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <Card className="border-border shadow-md">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 bg-secondary/50 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-secondary/50 rounded w-2/3 animate-pulse"></div>
          <div className="h-3 bg-secondary/50 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="h-14 w-14 bg-secondary/50 rounded-lg animate-pulse flex-shrink-0"></div>
      </div>
    </CardContent>
  </Card>
);

export const SkeletonListItem = () => (
  <div className="p-4 border border-border rounded-lg space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-secondary/50 rounded w-1/2 animate-pulse"></div>
        <div className="h-3 bg-secondary/50 rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="h-6 bg-secondary/50 rounded w-20 animate-pulse ml-4"></div>
    </div>
  </div>
);
