'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  financialHealthRecommendations,
  type FinancialHealthRecommendationsOutput,
} from '@/ai/flows/financial-health-recommendations';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  income: z.coerce.number().min(0, 'El ingreso debe ser un número positivo.'),
  expenses: z.coerce.number().min(0, 'Los gastos deben ser un número positivo.'),
  debt: z.coerce.number().min(0, 'La deuda debe ser un número positivo.'),
  savings: z.coerce.number().min(0, 'Los ahorros deben ser un número positivo.'),
  goals: z.string().min(10, 'Tus metas deben tener al menos 10 caracteres.'),
});

export default function HealthPage() {
  const [recommendations, setRecommendations] =
    useState<FinancialHealthRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: 0,
      expenses: 0,
      debt: 0,
      savings: 0,
      goals: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await financialHealthRecommendations(values);
      setRecommendations(result);
    } catch (error) {
      console.error('Error getting financial recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">
          Evaluación de Salud Financiera
        </h1>
        <p className="mt-2 text-muted-foreground">
          Utiliza esta herramienta para evaluar tu salud financiera y obtener
          recomendaciones personalizadas de la IA.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingreso Mensual (MXN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3000" {...field} />
                      </FormControl>
                      <FormDescription>Tu ingreso total después de impuestos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gastos Mensuales (MXN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2500" {...field} />
                      </FormControl>
                       <FormDescription>Suma de todos tus gastos fijos y variables.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deuda Total (MXN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} />
                      </FormControl>
                       <FormDescription>Incluye tarjetas de crédito, préstamos, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="savings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ahorros Totales (MXN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                       <FormDescription>Tu fondo de emergencia y otros ahorros.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metas Financieras</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Reducir mi deuda de tarjeta, ahorrar para unas vacaciones, crear un fondo de emergencia..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      ¿Qué es lo más importante para ti en este momento?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  'Obtener Recomendaciones'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            La IA está analizando tu situación...
          </p>
        </div>
      )}

      {recommendations && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="text-accent" />
              Recomendaciones Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                <p>{recommendations.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
