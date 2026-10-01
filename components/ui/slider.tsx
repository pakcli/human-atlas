import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = 'horizontal',
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  const isVertical = orientation === 'vertical';

  return (
    <SliderPrimitive.Root
      className={cn('ui-slider', isVertical ? 'ui-slider-vertical' : 'ui-slider-horizontal', className)}
      data-slot="slider"
      data-orientation={orientation}
      orientation={orientation}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="center"
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn('ui-slider-control', isVertical ? 'ui-slider-control-vertical' : 'ui-slider-control-horizontal')}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="ui-slider-track"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="ui-slider-range"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="ui-slider-thumb"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
