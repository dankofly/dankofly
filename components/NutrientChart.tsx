import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { Nutrients, Language } from '../types';
import { RDA, NUTRIENT_LABELS } from '../constants';

interface Props {
  currentIntake: Nutrients;
  language?: Language;
  height?: number | string;
  simple?: boolean;
}

const NutrientChart: React.FC<Props> = ({ currentIntake, language = 'de', height = 480, simple = false }) => {
  const labels = NUTRIENT_LABELS[language];

  // Definition der Nährstoffe und ihrer Anzeigenamen/Einheiten
  const nutrientConfig: Record<keyof Nutrients, { label: string; unit: string; group: 'macro' | 'micro' }> = {
    energy: { label: labels.energy, unit: 'kcal', group: 'macro' },
    protein: { label: labels.protein, unit: 'g', group: 'macro' },
    carbs: { label: labels.carbs, unit: 'g', group: 'macro' },
    sugar: { label: labels.sugar, unit: 'g', group: 'macro' },
    fat: { label: labels.fat, unit: 'g', group: 'macro' },
    saturatedFat: { label: labels.saturatedFat, unit: 'g', group: 'macro' },
    selenium: { label: labels.selenium, unit: 'µg', group: 'micro' },
    omega3: { label: labels.omega3, unit: 'g', group: 'micro' },
    magnesium: { label: labels.magnesium, unit: 'mg', group: 'micro' },
    calcium: { label: labels.calcium, unit: 'mg', group: 'micro' },
    iron: { label: labels.iron, unit: 'mg', group: 'micro' },
    zinc: { label: labels.zinc, unit: 'mg', group: 'micro' },
    potassium: { label: labels.potassium, unit: 'mg', group: 'micro' },
    vitaminE: { label: labels.vitaminE, unit: 'mg', group: 'micro' },
    b1: { label: labels.b1, unit: 'mg', group: 'micro' },
    b6: { label: labels.b6, unit: 'mg', group: 'micro' },
  };

  const keys: (keyof Nutrients)[] = [
    'protein', 'carbs', 'fat',
    'selenium', 'vitaminE', 'magnesium', 'omega3', 'zinc', 'iron', 'calcium', 'potassium', 'b1', 'b6'
  ];

  const data = keys.map(key => {
    const value = currentIntake[key] || 0;
    const rda = RDA[key] || 1;
    const percentage = (value / rda) * 100;
    
    return {
      name: nutrientConfig[key].label,
      percent: percentage,
      visualPercent: Math.min(percentage, 120), // Cap for visual bar length
      actual: value,
      unit: nutrientConfig[key].unit,
      rda: rda,
      key: key
    };
  });

  // Custom Label Renderer to show Checkmark when 100% is reached
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const isReached = value >= 100;
    // Increased font sizes for simple mode
    const fontSize = simple ? 10 : 11;
    const iconSize = simple ? 6 : 7;
    const offset = simple ? 6 : 8;
    
    return (
      <g>
        <text 
          x={x + width + offset} 
          y={y + height / 2 + (simple ? 4 : 4)} 
          fill={isReached ? '#15803d' : '#78716c'} // Green-700 or Stone-500
          fontSize={fontSize} 
          fontWeight="800"
          fontFamily="monospace"
        >
          {value.toFixed(0)}%
        </text>
        {isReached && !simple && (
           <g transform={`translate(${x + width + offset + 40}, ${y + height / 2 - (simple ? 3 : 5)})`}>
              <circle cx="0" cy="0" r={iconSize} fill="#10b981" />
              <path d={simple ? "M-1.5 0.5 L0 2 L2 -1" : "M-2.5 0.5 L-0.5 2.5 L3 -2"} stroke="white" strokeWidth="1.5" fill="none" />
           </g>
        )}
      </g>
    );
  };

  return (
    <div className={`bg-white rounded-2xl ${simple ? 'p-1' : 'p-6 shadow-xl'} border ${simple ? 'border-transparent' : 'border-brand-border'} flex flex-col h-full w-full overflow-hidden`}>
      {!simple && (
        <div className="flex justify-between items-center mb-6">
            <div>
            <h3 className="text-xl font-bold text-brand-light">{language === 'de' ? 'Nährstoff-Profil' : 'Nutrient Profile'}</h3>
            <p className="text-xs text-brand-muted uppercase tracking-widest font-semibold mt-1">
                {language === 'de' ? 'Status in % der Tagesempfehlung' : 'Status in % of RDA'}
            </p>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> OPTIMAL
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div> {language === 'de' ? 'GUT' : 'GOOD'}
                </div>
            </div>
        </div>
      )}

      {/* DYNAMIC HEIGHT CONTAINER */}
      <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={simple ? { top: 0, right: 35, left: 0, bottom: 0 } : { top: 5, right: 65, left: 10, bottom: 5 }}
            barSize={simple ? 14 : 18} 
          >
            <XAxis type="number" domain={[0, 120]} hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={simple ? 95 : 100} 
              tick={{ fill: '#44403c', fontSize: simple ? 11 : 11, fontWeight: 700 }} 
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip 
              cursor={{ fill: '#f5f5f4', opacity: 0.5 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-brand-accent p-3 rounded-xl shadow-2xl z-50 min-w-[160px]">
                      <p className="font-bold text-brand-light border-b border-brand-input pb-1 mb-2">{item.name}</p>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-brand-muted">{language === 'de' ? 'Aufnahme' : 'Intake'}:</span>
                        <span className="font-bold text-brand-light">{item.actual.toFixed(2)} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-brand-muted">{language === 'de' ? 'Ziel (RDA)' : 'Goal (RDA)'}:</span>
                        <span className="text-brand-light">{item.rda} {item.unit}</span>
                      </div>
                      <div className={`text-[10px] font-black py-1 px-2 rounded text-center ${item.percent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-input text-brand-muted'}`}>
                        {item.percent.toFixed(1)}% {language === 'de' ? 'ERREICHT' : 'REACHED'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={100} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Bar 
              dataKey="visualPercent" 
              radius={[0, 10, 10, 0]}
              animationDuration={800}
            >
              {data.map((entry, index) => {
                let color = '#d6d3d1'; // Default grey
                if (entry.percent >= 100) color = '#10b981'; // Optimal
                else if (entry.percent >= 50) color = '#b0bf57'; // Good
                else if (entry.percent >= 25) color = '#d6d3d1'; // Muted
                
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList 
                dataKey="percent" 
                content={renderCustomLabel} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {!simple && (
        <div className="mt-4 pt-4 border-t border-brand-input">
            <p className="text-[10px] text-brand-muted text-center italic">
            {language === 'de' 
                ? 'Die gestrichelte Linie markiert 100% der empfohlenen Tagesdosis (RDA). Werte basieren auf Laboranalysen aktivierter Nüsse.'
                : 'The dashed line marks 100% of the Recommended Daily Allowance (RDA). Values based on lab analysis of activated nuts.'}
            </p>
        </div>
      )}
    </div>
  );
};

export default NutrientChart;