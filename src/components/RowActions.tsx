import { useState } from 'react';
import { Eye, Edit3, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { StockItem } from '../lib/api';

interface RowActionsProps {
  item: StockItem;
  onUpdate: (id: string, updates: Partial<StockItem>) => void;
  allowEdit?: boolean;
}

export function RowActions({ item, onUpdate, allowEdit = true }: RowActionsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    quantity: item.quantity,
    remarks: item.remarks,
  });

  const handleSave = () => {
    onUpdate(item.id, editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      quantity: item.quantity,
      remarks: item.remarks,
    });
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowDetails(true)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        {allowEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Item Details</DialogTitle>
            <DialogDescription>SKU: {item.sku}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Brand</Label>
                <p className="mt-1">{item.brand}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Product</Label>
                <p className="mt-1">{item.product}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">City</Label>
                <p className="mt-1">{item.city}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Quantity</Label>
                <p className="mt-1">{item.quantity}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Sell Price</Label>
                <p className="mt-1">${item.sellPrice.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Cost Price</Label>
                <p className="mt-1">${item.costPrice.toLocaleString()}</p>
              </div>
            </div>
            {item.remarks && (
              <div>
                <Label className="text-xs text-gray-500">Remarks</Label>
                <p className="mt-1">{item.remarks}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Update quantity and remarks for {item.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editValues.quantity}
                onChange={(e) =>
                  setEditValues({ ...editValues, quantity: parseInt(e.target.value) || 0 })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={editValues.remarks}
                onChange={(e) =>
                  setEditValues({ ...editValues, remarks: e.target.value })
                }
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
