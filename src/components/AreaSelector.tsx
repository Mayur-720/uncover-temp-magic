
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const AreaSelector: React.FC = () => {
  return (
    <Button variant="outline" size="sm" className="w-full mb-2">
      <MapPin size={16} className="mr-2" />
      Select Area
    </Button>
  );
};

export default AreaSelector;
