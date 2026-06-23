interface ImageWithOverlayProps {
  src: string;
  alt: string;
  /** Uygulama eski sürümden geliyorsa title/overlayTexts şeklinde kullanılmış olabilir. */
  title?: string;
  subtitle?: string;
  /** EpisodeComments/ProfilePage tarafında overlayTexts kullanılıyor. */
  overlayTexts?: string[];
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}


export default function ImageWithOverlay({
  src,
  alt,
  title,
  subtitle,
  overlayTexts,
  className = '',
  onError,
}: ImageWithOverlayProps) {

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={className}
        onError={onError}
      />
      {/* Altta soldan sağa karartan gradient */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      
      {/* Metin bloğu */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pointer-events-none">
        {subtitle && (
          <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase mb-0.5 drop-shadow-lg">
            {subtitle}
          </p>
        )}

        {/* overlayTexts gelen eski kullanım */}
        {overlayTexts && overlayTexts.length > 0 ? (
          overlayTexts.slice(0, 2).map((t, idx) => (
            <p
              key={`${idx}-${t}`}
              className="text-white font-bold leading-tight drop-shadow-lg"
              style={{
                fontSize: 'clamp(11px, 2.8vw, 15px)',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {t}
            </p>
          ))
        ) : (
          <p className="text-white font-bold leading-tight drop-shadow-lg"
            style={{
              fontSize: 'clamp(11px, 2.8vw, 15px)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </p>
        )}

      </div>
    </div>
  );
}