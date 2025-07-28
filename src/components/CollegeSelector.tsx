
import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

const CollegeSelector: React.FC = () => {
  return (
    <Button variant="outline" size="sm" className="w-full mb-2">
      <GraduationCap size={16} className="mr-2" />
      Select College
    </Button>
  );
};

export default CollegeSelector;
