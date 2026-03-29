export const imageFilters = {
  clarendon: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2);
      data[i+1] = Math.min(255, data[i+1] * 1.1);
      data[i+2] = Math.min(255, data[i+2] * 1.1);
    }
    return imageData;
  },
  
  juno: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.1);
      data[i+1] = Math.min(255, data[i+1] * 0.9);
      data[i+2] = Math.min(255, data[i+2] * 0.8);
    }
    return imageData;
  },
  
  lark: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.05);
      data[i+1] = Math.min(255, data[i+1] * 1.1);
      data[i+2] = Math.min(255, data[i+2] * 1.15);
    }
    return imageData;
  },
  
  gingham: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.9);
      data[i+1] = Math.min(255, data[i+1] * 0.85);
      data[i+2] = Math.min(255, data[i+2] * 0.8);
    }
    return imageData;
  },
  
  valencia: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.15);
      data[i+1] = Math.min(255, data[i+1] * 0.95);
      data[i+2] = Math.min(255, data[i+2] * 0.85);
    }
    return imageData;
  },
  
  ludwig: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = avg * 1.1;
      data[i+1] = avg * 1.05;
      data[i+2] = avg;
    }
    return imageData;
  },
  
  aden: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.95);
      data[i+1] = Math.min(255, data[i+1] * 0.9);
      data[i+2] = Math.min(255, data[i+2] * 1.1);
    }
    return imageData;
  },
  
  perpetua: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2);
      data[i+1] = Math.min(255, data[i+1] * 1.05);
      data[i+2] = Math.min(255, data[i+2] * 0.9);
    }
    return imageData;
  },
  
  slumber: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.85);
      data[i+1] = Math.min(255, data[i+1] * 0.8);
      data[i+2] = Math.min(255, data[i+2] * 0.75);
    }
    return imageData;
  },
  
  lofi: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.floor(data[i] / 32) * 32);
      data[i+1] = Math.min(255, Math.floor(data[i+1] / 32) * 32);
      data[i+2] = Math.min(255, Math.floor(data[i+2] / 32) * 32);
    }
    return imageData;
  },
  
  dogFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.3);
      data[i+1] = Math.min(255, data[i+1] * 0.8);
      data[i+2] = Math.min(255, data[i+2] * 0.7);
    }
    return imageData;
  },
  
  babyFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.25);
      data[i+1] = Math.min(255, data[i+1] * 1.2);
      data[i+2] = Math.min(255, data[i+2] * 1.25);
    }
    return imageData;
  },
  
  vogueFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.05);
      data[i+1] = Math.min(255, data[i+1] * 1.15);
      data[i+2] = Math.min(255, data[i+2] * 1.25);
    }
    return imageData;
  },
  
  loveFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.4);
      data[i+1] = Math.min(255, data[i+1] * 0.7);
      data[i+2] = Math.min(255, data[i+2] * 0.8);
    }
    return imageData;
  },
  
  pleasantFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.1);
      data[i+1] = Math.min(255, data[i+1] * 1.05);
      data[i+2] = Math.min(255, data[i+2] * 1.1);
    }
    return imageData;
  },
  
  greenEyeFilter: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.8);
      data[i+1] = Math.min(255, data[i+1] * 1.3);
      data[i+2] = Math.min(255, data[i+2] * 0.8);
    }
    return imageData;
  },
  
  simpleLashes: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.15);
      data[i+1] = Math.min(255, data[i+1] * 0.95);
      data[i+2] = Math.min(255, data[i+2] * 1.05);
    }
    return imageData;
  },
  
  flowerCrown: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2);
      data[i+1] = Math.min(255, data[i+1] * 0.9);
      data[i+2] = Math.min(255, data[i+2] * 1.3);
    }
    return imageData;
  },
  
  neon: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 2);
      data[i+1] = Math.min(255, data[i+1] * 0.5);
      data[i+2] = Math.min(255, data[i+2] * 2);
    }
    return imageData;
  },
  
  blackAndWhite: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = avg;
      data[i+1] = avg;
      data[i+2] = avg;
    }
    return imageData;
  }
};

export const applyFilter = (imageElement: HTMLImageElement, filterName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject('Canvas context not available');
      return;
    }
    
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const filter = imageFilters[filterName as keyof typeof imageFilters];
    if (filter) {
      imageData = filter(imageData);
      ctx.putImageData(imageData, 0, 0);
    }
    
    resolve(canvas.toDataURL());
  });
};
