import { useState } from 'react';
import { InventoryItem } from '@/lib/stores/useCharacterStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus, Trash2, Package, Scale, Sparkles, Link as LinkIcon } from 'lucide-react';

interface InventoryPanelProps {
    inventory: InventoryItem[];
    currency: { cp: number; sp: number; ep: number; gp: number; pp: number; };
    strengthScore: number;
    onUpdate: (inventory: InventoryItem[]) => void;
    onUpdateCurrency: (currency: Partial<{ cp: number; sp: number; ep: number; gp: number; pp: number; }>) => void;
}

export function InventoryPanel({ inventory, currency, strengthScore, onUpdate, onUpdateCurrency }: InventoryPanelProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ name: '', quantity: 1, weight: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    const totalWeight = inventory?.reduce((sum, item) => sum + (item.weight * item.quantity), 0) || 0;
    const carryingCapacity = strengthScore * 15;
    const isEncumbered = totalWeight > carryingCapacity;
    const percentage = Math.min(100, (totalWeight / carryingCapacity) * 100);

    const attunedCount = inventory?.filter(i => i.attuned).length || 0;
    const maxAttunement = 3;

    const handleAddItem = () => {
        if (newItem.name) {
            const itemToAdd: InventoryItem = {
                id: crypto.randomUUID(),
                name: newItem.name,
                quantity: newItem.quantity || 1,
                weight: newItem.weight || 0,
                category: newItem.category || 'General',
                notes: newItem.notes || '',
                isMagic: newItem.isMagic || false,
                requiresAttunement: newItem.requiresAttunement || false,
                attuned: false,
            };

            onUpdate([...(inventory || []), itemToAdd]);

            setNewItem({ name: '', quantity: 1, weight: 0 });
            setIsAddDialogOpen(false);
        }
    };

    const handleUpdateItem = (itemId: string, updates: Partial<InventoryItem>) => {
        if (!inventory) return;
        const newInventory = inventory.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        onUpdate(newInventory);
    };

    const handleRemoveItem = (itemId: string) => {
        if (!inventory) return;
        onUpdate(inventory.filter(item => item.id !== itemId));
    };

    const toggleEquip = (item: InventoryItem) => {
        handleUpdateItem(item.id, { equipped: !item.equipped });
    };

    const toggleAttune = (item: InventoryItem) => {
        if (!item.attuned && attunedCount >= maxAttunement) return; // Prevent over-attunement
        handleUpdateItem(item.id, { attuned: !item.attuned });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6" /> Inventory
                </h2>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Filter by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="weapon">Weapons</SelectItem>
                        <SelectItem value="armor">Armor</SelectItem>
                        <SelectItem value="shield">Shields</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="equipped">Equipped</SelectItem>
                        <SelectItem value="attuned">Attuned</SelectItem>
                        <SelectItem value="magic">Magic Items</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-5 gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                {['cp', 'sp', 'ep', 'gp', 'pp'].map((coin) => (
                    <div key={coin} className="flex flex-col gap-1">
                        <Label htmlFor={`coin-${coin}`} className="text-xs text-slate-500 uppercase text-center font-bold">{coin}</Label>
                        <Input
                            id={`coin-${coin}`}
                            type="number"
                            min="0"
                            value={currency?.[coin as keyof typeof currency] || 0}
                            onChange={(e) => onUpdateCurrency({ [coin]: parseInt(e.target.value) || 0 })}
                            className="h-8 text-center bg-slate-950 border-slate-700 focus:ring-amber-500 px-1"
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="flex-1 bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Scale className="w-4 h-4" />
                            <span>Encumbrance</span>
                        </div>
                        <span className={`text-sm font-bold ${isEncumbered ? 'text-red-400' : 'text-slate-200'}`}>
                            {totalWeight.toFixed(1)} / {carryingCapacity} lbs
                        </span>
                    </div>
                    <Progress value={percentage} className={`h-2 ${isEncumbered ? 'bg-red-900/20' : ''}`} indicatorClassName={isEncumbered ? 'bg-red-500' : 'bg-amber-500'} />
                    {isEncumbered && (
                        <div className="text-xs text-red-400 font-medium text-center">
                            Speed drops to 5 ft.
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-800 w-1/3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400">
                            <LinkIcon className="w-4 h-4" />
                            <span>Attunement</span>
                        </div>
                        <span className={`text-sm font-bold ${attunedCount > maxAttunement ? 'text-red-400' : 'text-slate-200'}`}>
                            {attunedCount} / {maxAttunement}
                        </span>
                    </div>
                    <Progress value={(attunedCount / maxAttunement) * 100} className="h-2" indicatorClassName="bg-purple-500" />
                </div>
            </div>

            <div className="grid gap-2">
                {(!inventory || inventory.length === 0) && (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/20 rounded-lg border border-dashed border-slate-800">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Inventory is empty.</p>
                        <Button variant="link" onClick={() => setIsAddDialogOpen(true)} className="text-amber-500">
                            Add your first item
                        </Button>
                    </div>
                )}
                {inventory?.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = filterType === 'all' ||
                        (filterType === 'equipped' && item.equipped) ||
                        (filterType === 'attuned' && item.attuned) ||
                        (filterType === 'magic' && item.isMagic) ||
                        item.type === filterType;
                    return matchesSearch && matchesFilter;
                }).map((item) => (
                    <Card key={item.id} className={`bg-slate-900 border-slate-800 ${item.equipped ? 'border-amber-500/50 ring-1 ring-amber-500/20' : ''}`}>
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="font-medium truncate text-slate-200 flex items-center gap-2">
                                    {item.name}
                                    {item.isMagic && <Sparkles className="w-3 h-3 text-purple-400" />}
                                </div>
                                <div className="flex gap-1">
                                    {item.equipped && <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[10px] h-5 px-1.5">Equipped</Badge>}
                                    {item.attuned && <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 text-[10px] h-5 px-1.5">Attuned</Badge>}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>{item.weight > 0 ? `${item.weight} lb` : '-'} {item.weight > 0 && item.quantity > 1 ? `(Total: ${(item.weight * item.quantity).toFixed(1)})` : ''}</span>
                                    {item.type && <span className="text-slate-600">• {item.type}</span>}
                                    {item.requiresAttunement && <span className="text-purple-500/70 italic">• Requires Attunement</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {['weapon', 'armor', 'shield'].includes(item.type || '') && (
                                    <Button
                                        variant={item.equipped ? "default" : "outline"}
                                        size="sm"
                                        className={`h-8 text-xs ${item.equipped ? 'bg-amber-600 hover:bg-amber-700' : 'text-slate-400 border-slate-700 hover:bg-slate-800'}`}
                                        onClick={() => toggleEquip(item)}
                                    >
                                        {item.equipped ? 'Unequip' : 'Equip'}
                                    </Button>
                                )}

                                {item.requiresAttunement && (
                                    <Button
                                        variant={item.attuned ? "default" : "outline"}
                                        size="sm"
                                        className={`h-8 text-xs ${item.attuned ? 'bg-purple-600 hover:bg-purple-700' : 'text-purple-400 border-purple-900/50 hover:bg-purple-900/20'}`}
                                        onClick={() => toggleAttune(item)}
                                        disabled={!item.attuned && attunedCount >= maxAttunement}
                                    >
                                        <LinkIcon className="w-3 h-3 mr-1" />
                                        {item.attuned ? 'Attuned' : 'Attune'}
                                    </Button>
                                )}

                                <div className="flex items-center border border-slate-700 rounded-md bg-slate-950">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-r-none hover:bg-slate-800 text-slate-400"
                                        onClick={() => {
                                            if (item.quantity > 1) {
                                                handleUpdateItem(item.id, { quantity: item.quantity - 1 });
                                            } else {
                                                handleRemoveItem(item.id);
                                            }
                                        }}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-mono text-slate-300">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-l-none hover:bg-slate-800 text-slate-400"
                                        onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
                }
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="i-name">Item Name</Label>
                            <Input
                                id="i-name"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="e.g. Longsword"
                                className="bg-slate-900 border-slate-800 focus:ring-amber-500"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="i-type">Category</Label>
                                <Select
                                    value={newItem.type}
                                    onValueChange={(val: any) => setNewItem({ ...newItem, type: val })}
                                >
                                    <SelectTrigger id="i-type" className="bg-slate-900 border-slate-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weapon">Weapon</SelectItem>
                                        <SelectItem value="armor">Armor</SelectItem>
                                        <SelectItem value="shield">Shield</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="i-qty">Quantity</Label>
                                <Input
                                    id="i-qty"
                                    type="number"
                                    min="1"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                    className="bg-slate-900 border-slate-800 focus:ring-amber-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="i-weight">Weight (lbs)</Label>
                                <Input
                                    id="i-weight"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={newItem.weight}
                                    onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-900 border-slate-800 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="i-notes">Notes / Properties</Label>
                            <Input
                                id="i-notes"
                                value={newItem.notes || ''}
                                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                placeholder="e.g. Finesse, Versatile"
                                className="bg-slate-900 border-slate-800 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="i-magic"
                                    checked={newItem.isMagic || false}
                                    onCheckedChange={(checked) => setNewItem({ ...newItem, isMagic: checked })}
                                />
                                <Label htmlFor="i-magic">Magic Item</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="i-attune"
                                    checked={newItem.requiresAttunement || false}
                                    onCheckedChange={(checked) => setNewItem({ ...newItem, requiresAttunement: checked })}
                                />
                                <Label htmlFor="i-attune">Requires Attunement</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem} disabled={!newItem.name} className="bg-amber-600 hover:bg-amber-700 text-white">Add Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
