
import React, { useCallback, useState } from 'react';
import { CardData, Supertype, ElementType, Attack } from '../../types';
import { InputField, TextAreaField } from '../ui/FormControls';
import { CombatIcon, EnergyIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, RobotIcon, PlusIcon } from '../Icons';
import { generateSingleAttack } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormCombatProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    user: any;
    onLoginRequired: () => void;
    addNotification: (type: 'success' | 'error', msg: string) => void;
}

export const FormCombat: React.FC<FormCombatProps> = ({ data, onChange, user, onLoginRequired, addNotification }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { t } = useLanguage();

    const handleGenerateAttack = async (index: number) => {
        if (!user) { onLoginRequired(); return; }
        if(isGenerating) return;
        setIsGenerating(true);
        try {
            const newAttack = await generateSingleAttack(data.name, data.type);
            if (newAttack) {
                const newAttacks = [...data.attacks];
                newAttacks[index] = { ...newAttacks[index], ...newAttack };
                onChange('attacks', newAttacks);
                addNotification('success', 'Attack generated!');
            }
        } catch (error: any) {
            addNotification('error', error.message || 'Failed to generate attack.');
        } finally {
            setIsGenerating(false);
        }
    };

    const addAttack = useCallback(() => {
        const newAttack: Attack = {
            id: Date.now().toString(),
            name: 'New Attack',
            cost: [ElementType.Colorless],
            damage: '',
            description: ''
        };
        onChange('attacks', [...data.attacks, newAttack]);
    }, [data.attacks, onChange]);
  
    const removeAttack = useCallback((index: number) => {
        const newAttacks = data.attacks.filter((_, i) => i !== index);
        onChange('attacks', newAttacks);
    }, [data.attacks, onChange]);
  
    const moveAttack = useCallback((index: number, direction: 'up' | 'down') => {
        const newAttacks = [...data.attacks];
        if (direction === 'up' && index > 0) {
            [newAttacks[index], newAttacks[index - 1]] = [newAttacks[index - 1], newAttacks[index]];
        } else if (direction === 'down' && index < newAttacks.length - 1) {
            [newAttacks[index], newAttacks[index + 1]] = [newAttacks[index + 1], newAttacks[index]];
        }
        onChange('attacks', newAttacks);
    }, [data.attacks, onChange]);
  
    const updateAttack = useCallback((index: number, field: keyof Attack, value: any) => {
      const newAttacks = [...data.attacks];
      newAttacks[index] = { ...newAttacks[index], [field]: value };
      onChange('attacks', newAttacks);
    }, [data.attacks, onChange]);
  
    const updateAttackCost = useCallback((index: number, costIndex: number, type: ElementType) => {
      const newAttacks = [...data.attacks];
      const newCost = [...newAttacks[index].cost];
      newCost[costIndex] = type;
      newAttacks[index].cost = newCost;
      onChange('attacks', newAttacks);
    }, [data.attacks, onChange]);
  
    const addAttackCost = useCallback((index: number) => {
      const newAttacks = [...data.attacks];
      if (newAttacks[index].cost.length < 5) {
          newAttacks[index].cost.push(ElementType.Colorless);
          onChange('attacks', newAttacks);
      }
    }, [data.attacks, onChange]);
    
    const removeAttackCost = useCallback((index: number) => {
      const newAttacks = [...data.attacks];
      if (newAttacks[index].cost.length > 0) {
          newAttacks[index].cost.pop();
          onChange('attacks', newAttacks);
      }
    }, [data.attacks, onChange]);

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800 pb-2">
                <CombatIcon className="w-5 h-5 text-blue-400" />
                {data.supertype === Supertype.Pokemon ? 'Attacks & Abilities' : 'Card Effect'}
            </div>

            {data.supertype === Supertype.Pokemon ? (
                <>
                    {data.attacks.map((attack, idx) => (
                        <div key={attack.id} className="bg-[#161b22] p-4 rounded-xl border border-gray-800 space-y-3 relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                    {idx > 0 && (
                                        <button onClick={() => moveAttack(idx, 'up')} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white" title="Move Up">
                                            <ArrowUpIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                    {idx < data.attacks.length - 1 && (
                                        <button onClick={() => moveAttack(idx, 'down')} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white" title="Move Down">
                                            <ArrowDownIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                    <button 
                                    onClick={() => removeAttack(idx)}
                                    className="p-1 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-400 transition-colors ml-1"
                                    title="Remove Attack"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                            </div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                Attack {idx + 1}
                                <button onClick={() => handleGenerateAttack(idx)} className="text-purple-400 hover:text-purple-300 transition-colors hover:scale-110" title="AI Generate This Attack">
                                    <RobotIcon className="w-3.5 h-3.5" />
                                </button>
                            </h3>
                            
                            <InputField 
                                label="Name"
                                value={attack.name} 
                                onChange={(v: any) => updateAttack(idx, 'name', v)} 
                            />
                            
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Cost</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {attack.cost.map((c, costIdx) => (
                                            <div key={costIdx} className="relative group/cost cursor-pointer active:scale-90 transition-transform" onClick={() => {
                                                const types = Object.values(ElementType);
                                                const currentIdx = types.indexOf(c);
                                                const nextType = types[(currentIdx + 1) % types.length];
                                                updateAttackCost(idx, costIdx, nextType);
                                            }}>
                                                <EnergyIcon type={c} size={24} flat />
                                            </div>
                                    ))}
                                    <button onClick={() => addAttackCost(idx)} className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 shadow-sm active:scale-90">+</button>
                                    <button onClick={() => removeAttackCost(idx)} className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 shadow-sm active:scale-90">-</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <InputField 
                                    label="Damage"
                                    value={attack.damage} 
                                    onChange={(v: any) => updateAttack(idx, 'damage', v)} 
                                    placeholder="e.g. 50"
                                />
                                <TextAreaField
                                    label="Effect"
                                    value={attack.description}
                                    onChange={(val: any) => updateAttack(idx, 'description', val)}
                                    height="h-16"
                                />
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={addAttack}
                        className="w-full py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 font-bold text-xs hover:border-gray-500 hover:text-gray-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-gray-800/50"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Attack
                    </button>
                </>
            ) : (
                <div>
                        <TextAreaField
                        label={data.supertype === Supertype.Trainer ? 'Rules / Effect' : 'Energy Effect'}
                        value={data.rules?.[0] || ''}
                        onChange={(val: any) => onChange('rules', [val])}
                        height="h-48"
                        placeholder="Describe the card's effect..."
                    />
                </div>
            )}
        </div>
    );
};
