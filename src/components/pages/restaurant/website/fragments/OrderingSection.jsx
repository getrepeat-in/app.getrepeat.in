"use client";
import { Switch } from "@/components/ui/switch";
import { Utensils, ShoppingBag, Truck, Banknote, CreditCard } from "lucide-react";

const OrderingSection = ({ formik }) => {
  const acceptedTypes = formik.values.ordering?.acceptedTypes || [];
  const paymentMethods = formik.values.ordering?.paymentMethods || [];

  const handleOrderTypeChange = (type, checked) => {
    let newTypes = [...acceptedTypes];
    if (checked) {
      if (!newTypes.includes(type)) newTypes.push(type);
    } else {
      newTypes = newTypes.filter((t) => t !== type);
    }
    formik.setFieldValue("ordering.acceptedTypes", newTypes);
  };

  const handlePaymentMethodChange = (method, checked) => {
    let newMethods = [...paymentMethods];
    if (checked) {
      if (!newMethods.includes(method)) newMethods.push(method);
    } else {
      newMethods = newMethods.filter((m) => m !== method);
    }
    formik.setFieldValue("ordering.paymentMethods", newMethods);
  };

  const orderTypeOptions = [
    { id: "DINE_IN", label: "Dine-In", icon: Utensils, description: "Allow customers to order from their tables." },
    { id: "TAKEAWAY", label: "Takeaway", icon: ShoppingBag, description: "Allow customers to order for pickup." },
    { id: "DELIVERY", label: "Delivery", icon: Truck, description: "Allow customers to request delivery." },
  ];

  const paymentMethodOptions = [
    { id: "CASH", label: "Pay at Counter / Cash", icon: Banknote, description: "Allow customers to pay physically." },
    { id: "ONLINE", label: "Online Payment", icon: CreditCard, description: "Accept digital payments securely." },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Ordering Configuration</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage which order types and payment methods your restaurant accepts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        <div className="space-y-4">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Accepted Order Types</h4>
          <div className="flex flex-col gap-3">
            {orderTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white dark:bg-zinc-900/30 transition-colors hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={acceptedTypes.includes(option.id)}
                    onCheckedChange={(checked) => handleOrderTypeChange(option.id, checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Accepted Payment Methods</h4>
          <div className="flex flex-col gap-3">
            {paymentMethodOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white dark:bg-zinc-900/30 transition-colors hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.includes(option.id)}
                    onCheckedChange={(checked) => handlePaymentMethodChange(option.id, checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border/50">
        <div className="mb-4">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Additional Fees</h4>
          <p className="text-xs text-muted-foreground mt-1">Configure extra charges applied during checkout.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Packing Charges */}
          <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-white dark:bg-zinc-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">Packing Charges</p>
              </div>
              <Switch
                checked={formik.values.ordering?.packingCharges?.isEnabled || false}
                onCheckedChange={(checked) => formik.setFieldValue("ordering.packingCharges.isEnabled", checked)}
              />
            </div>
            {formik.values.ordering?.packingCharges?.isEnabled && (
              <div className="flex items-center gap-2 mt-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-md border border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-medium text-muted-foreground pl-2">Amount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={formik.values.ordering?.packingCharges?.amount === 0 ? '' : (formik.values.ordering?.packingCharges?.amount ?? '')}
                  onChange={(e) => formik.setFieldValue("ordering.packingCharges.amount", e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 bg-white dark:bg-zinc-900 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Platform Fee */}
          <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-white dark:bg-zinc-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                  <Banknote className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">Platform Fee</p>
              </div>
              <Switch
                checked={formik.values.ordering?.platformFee?.isEnabled || false}
                onCheckedChange={(checked) => formik.setFieldValue("ordering.platformFee.isEnabled", checked)}
              />
            </div>
            {formik.values.ordering?.platformFee?.isEnabled && (
              <div className="flex items-center gap-2 mt-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-md border border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-medium text-muted-foreground pl-2">Amount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={formik.values.ordering?.platformFee?.amount === 0 ? '' : (formik.values.ordering?.platformFee?.amount ?? '')}
                  onChange={(e) => formik.setFieldValue("ordering.platformFee.amount", e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 bg-white dark:bg-zinc-900 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Tax & Service Fee */}
          <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-white dark:bg-zinc-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">Tax & Service Fee</p>
              </div>
              <Switch
                checked={formik.values.ordering?.taxAndServiceFee?.isEnabled || false}
                onCheckedChange={(checked) => formik.setFieldValue("ordering.taxAndServiceFee.isEnabled", checked)}
              />
            </div>
            {formik.values.ordering?.taxAndServiceFee?.isEnabled && (
              <div className="flex items-center gap-2 mt-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-md border border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-medium text-muted-foreground pl-2">Percentage (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formik.values.ordering?.taxAndServiceFee?.amount === 0 ? '' : (formik.values.ordering?.taxAndServiceFee?.amount ?? '')}
                  onChange={(e) => formik.setFieldValue("ordering.taxAndServiceFee.amount", e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 bg-white dark:bg-zinc-900 border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingSection;
