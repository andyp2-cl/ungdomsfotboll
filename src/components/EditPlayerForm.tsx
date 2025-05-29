
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Player } from "@/types/player";
import { usePlayerForm } from "@/components/player-form/usePlayerForm";
import { PlayerPositionField } from "@/components/player-form/PlayerPositionField";
import { ImageUploadField } from "@/components/player-form/ImageUploadField";
import { DevelopmentFields } from "@/components/player-form/DevelopmentFields";
import { FormButtons } from "@/components/player-form/FormButtons";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditPlayerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (player: Player) => void;
  initialValues?: Player;
}

export function EditPlayerForm({
  isOpen,
  onClose,
  onSave,
  initialValues
}: EditPlayerFormProps) {
  const {
    form,
    imagePreview,
    setImagePreview,
    handleSubmit,
    isTrainer
  } = usePlayerForm({
    onSave,
    onCancel: onClose,
    initialValues
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Redigera spelare" : "Lägg till ny spelare"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Info */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namn *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ange spelarens namn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTrainer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Tränare
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Är denna person en tränare?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Aktiv spelare
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Inaktiva spelare visas inte i laguttagning
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isTrainer && (
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Klass</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Välj klass" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="jerseyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tröjnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="Ange tröjnummer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload */}
              <ImageUploadField
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
              />
            </div>

            {/* Positions */}
            <PlayerPositionField form={form} />

            {/* Development Fields */}
            {!isTrainer && <DevelopmentFields form={form} />}

            {/* Form Buttons */}
            <FormButtons onCancel={onClose} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
