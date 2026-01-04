"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";
import { WILAYAS } from "@/lib/wilayas";

interface Region {
  id: number;
  name: string;
  wilayas: string[];
  createdAt: string;
}

export default function AdminRegionConfig() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRegion, setEditingRegion] = useState<number | null>(null);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/regions", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Erreur de chargement");

      const data = await response.json();
      setRegions(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les régions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir toutes les wilayas déjà assignées
  const getAssignedWilayas = () => {
    const assigned = new Set<string>();
    regions.forEach(region => {
      if (editingRegion !== region.id) {
        region.wilayas.forEach(w => assigned.add(w));
      }
    });
    return assigned;
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region.id);
    setSelectedWilayas([...region.wilayas]);
  };

  const handleWilayaToggle = (wilayaName: string) => {
    setSelectedWilayas(prev => {
      if (prev.includes(wilayaName)) {
        return prev.filter(w => w !== wilayaName);
      } else {
        return [...prev, wilayaName];
      }
    });
  };

  const handleSave = async (regionId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/regions/${regionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wilayas: selectedWilayas }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      toast({
        title: "Succès",
        description: "Région mise à jour avec succès",
      });

      setEditingRegion(null);
      setSelectedWilayas([]);
      fetchRegions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la modification",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRegion(null);
    setSelectedWilayas([]);
  };

  const getRegionColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "nord":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "sud":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "est":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ouest":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const assignedWilayas = getAssignedWilayas();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {regions.map((region) => (
        <Card key={region.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRegionColor(region.name)}`}>
                  {region.name}
                </span>
              </CardTitle>
              {editingRegion === region.id ? (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleSave(region.id)}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => handleEdit(region)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>{editingRegion === region.id ? selectedWilayas.length : region.wilayas.length} wilayas</CardDescription>
          </CardHeader>
          <CardContent>
            {editingRegion === region.id ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {WILAYAS.map((wilaya) => {
                  const isAssigned = assignedWilayas.has(wilaya.name);
                  const isSelected = selectedWilayas.includes(wilaya.name);
                  
                  return (
                    <div key={wilaya.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`wilaya-${region.id}-${wilaya.code}`}
                        checked={isSelected}
                        disabled={isAssigned && !isSelected}
                        onCheckedChange={() => handleWilayaToggle(wilaya.name)}
                      />
                      <Label
                        htmlFor={`wilaya-${region.id}-${wilaya.code}`}
                        className={`text-sm font-normal cursor-pointer ${
                          isAssigned && !isSelected ? "text-muted-foreground" : ""
                        }`}
                      >
                        {wilaya.name}
                        {isAssigned && !isSelected && " (assignée)"}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {region.wilayas.map((wilaya, idx) => (
                  <Badge key={idx} variant="secondary">
                    {wilaya}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
