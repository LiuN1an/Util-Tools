import classNames from "classnames";
import Cropper from "react-easy-crop";
import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { debounce } from "lodash";

type PathProps = {
  x?: number;
  y?: number;
  scale?: number;
  cropSize?: { width: number; height: number };
};

export interface CropImageProps {
  src: string;
  onChange?: (path: PathProps) => void;
  path?: PathProps;
  className?: string;
  allowMove?: boolean;
}

export const CropImage: FC<CropImageProps> = ({
  src,
  path,
  className,
  onChange,
  allowMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<PathProps>({
    x: path?.x || 0,
    y: path?.y || 0,
    scale: path?.scale || 1,
    cropSize: path?.cropSize,
  });
  const [containerSize, setContainerSize] = useState(undefined);
  const [radio, setRadio] = useState(1);

  const calculateByCropSize = useCallback(
    (pathProps: PathProps) => {
      const { cropSize } = pathProps;
      if (cropSize && containerSize) {
        const { width: newW, height: newH } = cropSize;
        const { width: oldW, height: oldH } = containerSize;
        const oldS = oldW * oldH;
        const newS = newW * newH;
        setRadio(newS / oldS);
        setTransform({
          x: pathProps.x,
          y: pathProps.y,
          scale: pathProps.scale * (newS / oldS),
        });
      }
    },
    [containerSize]
  );

  useEffect(() => {
    if (!path?.x && !path?.y) {
      return;
    }
    const inputPath = { x: path?.x, y: path?.y, scale: path?.scale || 1 };
    setTransform(inputPath);
    calculateByCropSize({ ...inputPath, cropSize: path.cropSize });
  }, [calculateByCropSize, path]);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } =
        containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  }, []);

  const run = debounce(
    (props: PathProps) => {
      onChange?.(props);
    },
    300,
    { trailing: true }
  );

  return (
    <div
      className={classNames(
        className,
        "relative w-full h-full",
        !allowMove && "pointer-events-none"
      )}
      ref={containerRef}
    >
      <Cropper
        image={src}
        crop={{ x: transform.x, y: transform.y }}
        zoom={transform.scale}
        showGrid={false}
        objectFit="auto-cover"
        restrictPosition
        classes={{
          containerClassName: "rounded-lg",
        }}
        cropSize={transform.cropSize || containerSize}
        onCropChange={(props) => {
          const newTransform = {
            x: props.x,
            y: props.y,
            scale: transform.scale,
          };
          setTransform(newTransform);
          run({ ...newTransform, cropSize: containerSize });
        }}
        onZoomChange={(props) => {
          const newTransform = {
            x: transform.x,
            y: transform.y,
            scale: props * radio,
          };
          setTransform(newTransform);
          run({ ...newTransform, cropSize: containerSize });
        }}
      />
    </div>
  );
};
