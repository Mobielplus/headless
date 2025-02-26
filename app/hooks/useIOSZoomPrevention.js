import { useEffect } from 'react';

export function useIOSZoomPrevention() {
  useEffect(() => {
    console.log('useIOSZoomPrevention hook initialized');
    
    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]');
      console.log('Viewport meta tag found:', el);
    
      if (el !== null) {
        let content = el.getAttribute('content');
        console.log('Original viewport content:', content);
        
        let re = /maximum\-scale=[0-9\.]+/g;
    
        if (re.test(content)) {
          content = content.replace(re, 'maximum-scale=1.0');
          console.log('Updated existing maximum-scale property');
        } else {
          content = [content, 'maximum-scale=1.0'].join(', ');
          console.log('Added maximum-scale property');
        }
    
        el.setAttribute('content', content);
        console.log('Final viewport content:', content);
      }
    };
    
    const checkIsIOS = () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    const isIOS = checkIsIOS();
    console.log('Device is iOS:', isIOS);
    
    if (isIOS) {
      console.log('Applying iOS zoom prevention');
      addMaximumScaleToMetaViewport();
    }
  }, []);
}