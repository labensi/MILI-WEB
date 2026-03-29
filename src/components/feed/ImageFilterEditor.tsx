import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { applyFilter, imageFilters } from '../../utils/imageFilters';
import toast from 'react-hot-toast';

interface ImageFilterEditorProps {
  imageUrl: string;
  onSave: (filteredImageUrl: string) => void;
  onClose: () => void;
}

const filterNames = [
  'Original', 'Clarendon', 'Juno', 'Lark', 'Gingham', 'Valencia',
  'Ludwig', 'Aden', 'Perpetua', 'Slumber', 'Lo-Fi', 'Dog Filter',
  'Baby Filter', 'Vogue Filter', 'Love Filter', 'Pleasant Filter',
  'Green Eye Filter', 'Simple Lashes', 'Flower Crown', 'Neon', 'Black & White'
];

export const ImageFilterEditor: React.FC<ImageFilterEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState('Original');
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [applying, setApplying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const applySelectedFilter = async () => {
    if (selectedFilter === 'Original') {
      setPreviewUrl(imageUrl);
      return;
    }

    setApplying(true);
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const filteredUrl = await applyFilter(img, selectedFilter.toLowerCase().replace(/ /g, ''));
      setPreviewUrl(filteredUrl);
    } catch (error) {
      toast.error('Failed to apply filter');
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    applySelectedFilter();
  }, [selectedFilter]);

  const handleSave = () => {
    onSave(previewUrl);
    toast.success('Filter applied! ✨');
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Image" size="lg">
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative">
          <img
            ref={imgRef}
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-xl max-h-96 object-contain"
          />
          {applying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <Sparkles className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>

        {/* Filter Grid */}
        <div>
          <h3 className="text-white font-semibold mb-2">Filters</h3>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {filterNames.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`p-2 rounded-lg transition-all ${
                  selectedFilter === filter
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span className="text-xs">{filter}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} className="flex-1">
            <Check size={16} className="mr-2" />
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
};
