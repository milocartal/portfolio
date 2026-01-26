"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { Separator } from "~/app/_components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import { Switch } from "~/app/_components/ui/switch";
import { Button } from "~/app/_components/ui/button";

/**
 * Next.js App Router + shadcn/ui
 * - Colle ce fichier dans app/scop-salaire/page.tsx (ou un composant client importé)
 * - Assure-toi d'avoir installé shadcn/ui (Card, Input, Label, Separator, Table, Switch, Button)
 */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toNumber(value: string) {
  // Accepte "1 234,56" ou "1234.56"
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

/**
 * Barème "STATUT NON CADRE" (tel que sur ta feuille) :
 * - Salaire net < 1400€ => charges patronales = 10%
 * - 1400€ à 2240€ => taux progressif (interprétation: linéaire de 10% à 44%)
 * - 2240€ à 3500€ => 44%
 * - > 3500€ => 50%
 *
 * NB: Ta feuille montre aussi un cas "SMIC" où on utilise 10%.
 * Ici on te laisse choisir: "taux fixe (SMIC)" ou "barème (progressif)".
 */
function patronalRateFromNet(net: number) {
  if (net < 1400) return 0.1;

  if (net >= 1400 && net < 2240) {
    // Progressif linéaire de 10% -> 44% sur l'intervalle [1400;2240[
    const t = (net - 1400) / (2240 - 1400);
    return 0.1 + t * (0.44 - 0.1);
  }

  if (net >= 2240 && net <= 3500) return 0.44;

  return 0.5;
}

type Params = {
  caTTC: number;
  tvaRate: number; // ex: 0.20
  achats: number;

  appuiRate: number; // ex: 0.11
  chargesVariablesRate: number; // ex: 0.009 (0.9% du CA HT)
  fraisFonctionnement: number;

  chargesSalarialesRate: number; // ex: 0.22

  // charges patronales
  useProgressivePatronal: boolean;
  patronalFixedRate: number; // ex: 0.10 (SMIC)
};

function compute(p: Params) {
  const caHT = p.caTTC / (1 + p.tvaRate);
  const margeBrute = caHT - p.achats;

  const appui = margeBrute * p.appuiRate; // d’après ta feuille: x0,11 appliqué à la marge brute
  const chargesVariables = caHT * p.chargesVariablesRate;
  const resultatDisponible =
    margeBrute - appui - chargesVariables - p.fraisFonctionnement;

  // Sur ta feuille: le résultat disponible alimente la masse salariale
  const masseSalariale = resultatDisponible;

  // On calcule net via brut, mais le taux patronal progressif dépend du net.
  // On fait donc:
  // - mode fixe: direct
  // - mode progressif: on itère 2-3 fois pour converger (suffisant pour ce niveau de modèle).
  const chargesSalarialesRate = p.chargesSalarialesRate;

  const solveWithPatronalRate = (rate: number) => {
    const chargesPatronales = masseSalariale * rate;
    const salaireBrut = masseSalariale - chargesPatronales;
    const chargesSalariales = salaireBrut * chargesSalarialesRate;
    const salaireNet = salaireBrut - chargesSalariales;
    return { chargesPatronales, salaireBrut, chargesSalariales, salaireNet };
  };

  let patronalRate = p.patronalFixedRate;

  if (p.useProgressivePatronal) {
    // itération simple
    let netGuess = solveWithPatronalRate(0.1).salaireNet;
    for (let i = 0; i < 4; i++) {
      patronalRate = patronalRateFromNet(netGuess);
      const out = solveWithPatronalRate(patronalRate);
      netGuess = out.salaireNet;
    }
  }

  const payroll = solveWithPatronalRate(patronalRate);

  return {
    caHT,
    margeBrute,
    appui,
    chargesVariables,
    resultatDisponible,
    masseSalariale,

    patronalRate,
    ...payroll,
  };
}

export const IncomeCalculator: React.FC = () => {
  const [caTTCStr, setCaTTCStr] = React.useState("0");
  const [achatsStr, setAchatsStr] = React.useState("0");
  const [fraisStr, setFraisStr] = React.useState("0");

  const [useProgressive, setUseProgressive] = React.useState(false);

  // Paramètres (tu peux les rendre éditables si tu veux)
  const [tvaRateStr, setTvaRateStr] = React.useState("0,20");
  const [appuiRateStr, setAppuiRateStr] = React.useState("0,11");
  const [chargesVarRateStr, setChargesVarRateStr] = React.useState("0,009");
  const [chargesSalRateStr, setChargesSalRateStr] = React.useState("0,22");
  const [patronalFixedRateStr, setPatronalFixedRateStr] =
    React.useState("0,10");

  const params: Params = React.useMemo(
    () => ({
      caTTC: toNumber(caTTCStr),
      achats: toNumber(achatsStr),
      fraisFonctionnement: toNumber(fraisStr),

      tvaRate: clamp(toNumber(tvaRateStr), 0, 1),
      appuiRate: clamp(toNumber(appuiRateStr), 0, 1),
      chargesVariablesRate: clamp(toNumber(chargesVarRateStr), 0, 1),
      chargesSalarialesRate: clamp(toNumber(chargesSalRateStr), 0, 1),

      useProgressivePatronal: useProgressive,
      patronalFixedRate: clamp(toNumber(patronalFixedRateStr), 0, 1),
    }),
    [
      caTTCStr,
      achatsStr,
      fraisStr,
      tvaRateStr,
      appuiRateStr,
      chargesVarRateStr,
      chargesSalRateStr,
      patronalFixedRateStr,
      useProgressive,
    ],
  );

  const out = React.useMemo(() => compute(params), [params]);

  const resetDemo = () => {
    // Exemple proche de ta feuille (à ajuster)
    setCaTTCStr("4200");
    setAchatsStr("682"); // pour obtenir ~3518 marge brute si TVA 20%
    setFraisStr("450");
    setUseProgressive(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>SCOP — Du CA TTC au salaire net</CardTitle>
          <CardDescription>
            Calcul inspiré de ta feuille : TVA 20%, appui SCOP 11% (sur marge
            brute), charges variables 0,9% (sur CA HT), frais de fonctionnement,
            puis masse salariale → brut → net.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="caTTC">Chiffre d’affaires TTC</Label>
              <Input
                id="caTTC"
                inputMode="decimal"
                value={caTTCStr}
                onChange={(e) => setCaTTCStr(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="achats">
                Achats (liés directement à l’activité)
              </Label>
              <Input
                id="achats"
                inputMode="decimal"
                value={achatsStr}
                onChange={(e) => setAchatsStr(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frais">Frais de fonctionnement</Label>
              <Input
                id="frais"
                inputMode="decimal"
                value={fraisStr}
                onChange={(e) => setFraisStr(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Charges patronales</CardTitle>
                <CardDescription>
                  Mode SMIC (taux fixe) ou barème “statut non cadre” (progressif
                  selon le net).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium">
                      Utiliser le barème progressif
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Si activé, le taux patronal dépend du salaire net.
                    </div>
                  </div>
                  <Switch
                    checked={useProgressive}
                    onCheckedChange={setUseProgressive}
                  />
                </div>

                {!useProgressive ? (
                  <div className="space-y-2">
                    <Label htmlFor="patronalFixedRate">
                      Taux patronal fixe (ex: 0,10)
                    </Label>
                    <Input
                      id="patronalFixedRate"
                      inputMode="decimal"
                      value={patronalFixedRateStr}
                      onChange={(e) => setPatronalFixedRateStr(e.target.value)}
                    />
                    <div className="text-muted-foreground text-xs">
                      Sur ta feuille “hypothèse SMIC”, on est à 10%.
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <div>Barème utilisé :</div>
                    <ul className="list-disc pl-5">
                      <li>Net &lt; 1400€ → 10%</li>
                      <li>1400–2240€ → progressif (linéaire 10%→44%)</li>
                      <li>2240–3500€ → 44%</li>
                      <li>&gt; 3500€ → 50%</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">
                  Paramètres (modifiables)
                </CardTitle>
                <CardDescription>
                  Tu peux verrouiller ça si tu veux une version “clean”.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tva">TVA (ex: 0,20)</Label>
                  <Input
                    id="tva"
                    inputMode="decimal"
                    value={tvaRateStr}
                    onChange={(e) => setTvaRateStr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appui">Appui SCOP (ex: 0,11)</Label>
                  <Input
                    id="appui"
                    inputMode="decimal"
                    value={appuiRateStr}
                    onChange={(e) => setAppuiRateStr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chargesVar">
                    Charges variables (ex: 0,009)
                  </Label>
                  <Input
                    id="chargesVar"
                    inputMode="decimal"
                    value={chargesVarRateStr}
                    onChange={(e) => setChargesVarRateStr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chargesSal">
                    Charges salariales (ex: 0,22)
                  </Label>
                  <Input
                    id="chargesSal"
                    inputMode="decimal"
                    value={chargesSalRateStr}
                    onChange={(e) => setChargesSalRateStr(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetDemo}>
              Préremplir un exemple
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCaTTCStr("0");
                setAchatsStr("0");
                setFraisStr("0");
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Résultats</CardTitle>
          <CardDescription>
            Les montants sont calculés automatiquement. (Le résultat disponible
            alimente la masse salariale.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étape</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>CA TTC</TableCell>
                <TableCell className="text-right">
                  {eur(params.caTTC)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CA HT (TTC / (1 + TVA))</TableCell>
                <TableCell className="text-right">{eur(out.caHT)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Achats</TableCell>
                <TableCell className="text-right">
                  - {eur(params.achats)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marge brute</TableCell>
                <TableCell className="text-right">
                  {eur(out.margeBrute)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Appui SCOP ({Math.round(params.appuiRate * 1000) / 10}%)
                </TableCell>
                <TableCell className="text-right">- {eur(out.appui)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Charges variables (
                  {Math.round(params.chargesVariablesRate * 1000) / 10}% du CA
                  HT)
                </TableCell>
                <TableCell className="text-right">
                  - {eur(out.chargesVariables)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Frais de fonctionnement</TableCell>
                <TableCell className="text-right">
                  - {eur(params.fraisFonctionnement)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  Résultat disponible
                </TableCell>
                <TableCell className="text-right font-medium">
                  {eur(out.resultatDisponible)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Masse salariale</TableCell>
                <TableCell className="text-right">
                  {eur(out.masseSalariale)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Charges patronales (taux utilisé :{" "}
                  {Math.round(out.patronalRate * 1000) / 10}%)
                </TableCell>
                <TableCell className="text-right">
                  - {eur(out.chargesPatronales)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Salaire brut</TableCell>
                <TableCell className="text-right font-medium">
                  {eur(out.salaireBrut)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Charges salariales (
                  {Math.round(params.chargesSalarialesRate * 1000) / 10}%)
                </TableCell>
                <TableCell className="text-right">
                  - {eur(out.chargesSalariales)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">Salaire net</TableCell>
                <TableCell className="text-right font-semibold">
                  {eur(out.salaireNet)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Separator />

          <div className="text-muted-foreground space-y-1 text-xs">
            <div>
              Remarque : sur ta feuille, l’appui “10% + 1%” est appliqué comme{" "}
              <b>11% de la marge brute</b>, et les charges variables comme{" "}
              <b>0,9% du CA HT</b>.
            </div>
            <div>
              Si tu veux que je colle exactement à <i>toutes</i> les flèches de
              ton schéma (ex: /0,881, /1,10, /0,78), dis-moi lesquelles tu veux
              garder : je peux refaire les formules à l’identique.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
