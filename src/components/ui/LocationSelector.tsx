"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getDistricts,
  getBlocks,
  getPanchayats,
  getVillages,
  District,
  Block,
  Panchayat,
  Village,
} from "@/app/actions/location-actions";
import { toast } from "sonner";

interface LocationSelectorProps {
  onChange: (location: {
    districtId?: number;
    blockId?: number;
    panchayatId?: number;
    villageId?: number;
    lat?: number;
    lng?: number;
  }) => void;
  className?: string;
}

export default function LocationSelector({
  onChange,
  className,
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [loadingType, setLoadingType] = useState<
    "districts" | "blocks" | "panchayats" | "villages" | null
  >("districts");

  // Initialize and load all Chhattisgarh districts on mount
  useEffect(() => {
    getDistricts().then((res) => {
      setLoadingType(null);
      if (res.error) {
        toast.error(`Failed to load districts: ${res.error}`);
      } else if (res.data) {
        setDistricts(res.data);
      }
    });
  }, []);

  // Handle district choice
  const handleDistrictChange = (val: string) => {
    const districtId = parseInt(val, 10);
    setSelectedDistrict(val);

    // Reset and disable all lower dropdowns
    setSelectedBlock("");
    setSelectedPanchayat("");
    setSelectedVillage("");
    setBlocks([]);
    setPanchayats([]);
    setVillages([]);

    const districtObj = districts.find((d) => d.id === districtId);

    onChange({
      districtId,
      lat: districtObj?.lat ?? undefined,
      lng: districtObj?.lng ?? undefined,
    });

    setLoadingType("blocks");
    startTransition(async () => {
      const res = await getBlocks(districtId);
      setLoadingType(null);
      if (res.error) {
        toast.error(`Error loading blocks: ${res.error}`);
      } else if (res.data) {
        setBlocks(res.data);
      }
    });
  };

  // Handle block choice
  const handleBlockChange = (val: string) => {
    const blockId = parseInt(val, 10);
    setSelectedBlock(val);

    // Reset and disable all lower dropdowns
    setSelectedPanchayat("");
    setSelectedVillage("");
    setPanchayats([]);
    setVillages([]);

    const blockObj = blocks.find((b) => b.id === blockId);
    const districtId = parseInt(selectedDistrict, 10);
    const districtObj = districts.find((d) => d.id === districtId);

    onChange({
      districtId,
      blockId,
      lat: blockObj?.lat ?? districtObj?.lat ?? undefined,
      lng: blockObj?.lng ?? districtObj?.lng ?? undefined,
    });

    setLoadingType("panchayats");
    startTransition(async () => {
      const res = await getPanchayats(blockId);
      setLoadingType(null);
      if (res.error) {
        toast.error(`Error loading panchayats: ${res.error}`);
      } else if (res.data) {
        setPanchayats(res.data);
      }
    });
  };

  // Handle panchayat choice
  const handlePanchayatChange = (val: string) => {
    const panchayatId = parseInt(val, 10);
    setSelectedPanchayat(val);

    // Reset and disable village dropdown
    setSelectedVillage("");
    setVillages([]);

    const panchayatObj = panchayats.find((p) => p.id === panchayatId);
    const districtId = parseInt(selectedDistrict, 10);
    const blockId = parseInt(selectedBlock, 10);
    const blockObj = blocks.find((b) => b.id === blockId);
    const districtObj = districts.find((d) => d.id === districtId);

    onChange({
      districtId,
      blockId,
      panchayatId,
      lat: panchayatObj?.lat ?? blockObj?.lat ?? districtObj?.lat ?? undefined,
      lng: panchayatObj?.lng ?? blockObj?.lng ?? districtObj?.lng ?? undefined,
    });

    setLoadingType("villages");
    startTransition(async () => {
      const res = await getVillages(panchayatId);
      setLoadingType(null);
      if (res.error) {
        toast.error(`Error loading villages: ${res.error}`);
      } else if (res.data) {
        setVillages(res.data);
      }
    });
  };

  // Handle village choice
  const handleVillageChange = (val: string) => {
    const villageId = parseInt(val, 10);
    setSelectedVillage(val);

    const villageObj = villages.find((v) => v.id === villageId);
    const districtId = parseInt(selectedDistrict, 10);
    const blockId = parseInt(selectedBlock, 10);
    const blockObj = blocks.find((b) => b.id === blockId);
    const panchayatId = parseInt(selectedPanchayat, 10);
    const panchayatObj = panchayats.find((p) => p.id === panchayatId);
    const districtObj = districts.find((d) => d.id === districtId);

    onChange({
      districtId,
      blockId,
      panchayatId,
      villageId,
      lat: villageObj?.lat ?? panchayatObj?.lat ?? blockObj?.lat ?? districtObj?.lat ?? undefined,
      lng: villageObj?.lng ?? panchayatObj?.lng ?? blockObj?.lng ?? districtObj?.lng ?? undefined,
    });
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40 shadow-sm ${
        className || ""
      }`}
    >
      {/* 1. DISTRICT SELECTOR */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="lgd-district"
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          District {loadingType === "districts" && "⏳"}
        </Label>
        <Select
          value={selectedDistrict}
          onValueChange={handleDistrictChange}
          disabled={districts.length === 0 || isPending}
        >
          <SelectTrigger
            id="lgd-district"
            className="w-full min-w-full justify-between h-9 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/30"
          >
            <SelectValue
              placeholder={
                loadingType === "districts"
                  ? "Loading Districts..."
                  : "Select District"
              }
            />
          </SelectTrigger>
          <SelectContent position="popper">
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. BLOCK SELECTOR */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="lgd-block"
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          Block {loadingType === "blocks" && "⏳"}
        </Label>
        <Select
          value={selectedBlock}
          onValueChange={handleBlockChange}
          disabled={!selectedDistrict || blocks.length === 0 || isPending}
        >
          <SelectTrigger
            id="lgd-block"
            className="w-full min-w-full justify-between h-9 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/30"
          >
            <SelectValue
              placeholder={
                loadingType === "blocks" ? "Loading Blocks..." : "Select Block"
              }
            />
          </SelectTrigger>
          <SelectContent position="popper">
            {blocks.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. PANCHAYAT SELECTOR */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="lgd-panchayat"
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          Panchayat {loadingType === "panchayats" && "⏳"}
        </Label>
        <Select
          value={selectedPanchayat}
          onValueChange={handlePanchayatChange}
          disabled={!selectedBlock || panchayats.length === 0 || isPending}
        >
          <SelectTrigger
            id="lgd-panchayat"
            className="w-full min-w-full justify-between h-9 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/30"
          >
            <SelectValue
              placeholder={
                loadingType === "panchayats"
                  ? "Loading Panchayats..."
                  : "Select Panchayat"
              }
            />
          </SelectTrigger>
          <SelectContent position="popper">
            {panchayats.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. VILLAGE SELECTOR */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="lgd-village"
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          Village {loadingType === "villages" && "⏳"}
        </Label>
        <Select
          value={selectedVillage}
          onValueChange={handleVillageChange}
          disabled={!selectedPanchayat || villages.length === 0 || isPending}
        >
          <SelectTrigger
            id="lgd-village"
            className="w-full min-w-full justify-between h-9 border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500/30"
          >
            <SelectValue
              placeholder={
                loadingType === "villages"
                  ? "Loading Villages..."
                  : "Select Village"
              }
            />
          </SelectTrigger>
          <SelectContent position="popper">
            {villages.map((v) => (
              <SelectItem key={v.id} value={v.id.toString()}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
