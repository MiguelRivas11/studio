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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  generatePersonalizedLearningPath,
  type PersonalizedLearningPathOutput,
} from '@/ai/flows/personalized-learning-paths';
import { CheckCircle2, Loader2, School } from 'lucide-react';

const formSchema = z.object({
  currentKnowledgeLevel: z.enum(['principiante', 'intermedio', 'avanzado'], {
    required_error: 'Por favor, selecciona tu nivel de conocimiento.',
  }),
  financialGoals: z
    .string()
    .min(10, {
      message: 'Tus metas deben tener al menos 10 caracteres.',
    })
    .max(500, {
      message: 'Tus metas no deben exceder los 500 caracteres.',
    }),
  financialBackground: z
    .string()
    .min(10, {
      message: 'Tu contexto debe tener al menos 10 caracteres.',
    })
    .max(1000, {
      message: 'Tu contexto no debe exceder los 1000 caracteres.',
    }),
});

export default function LearnPage() {
  const [learningPath, setLearningPath] =
    useState<PersonalizedLearningPathOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialGoals: '',
      financialBackground: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLearningPath(null);
    try {
      const result = await generatePersonalizedLearningPath(values);
      setLearningPath(result);
    } catch (error) {
      console.error('Error generating learning path:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">
          Tu Ruta de Aprendizaje Personalizada
        </h1>
        <p className="mt-2 text-muted-foreground">
          Completa el formulario para que nuestra IA cree un plan de estudios a
          tu medida.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="currentKnowledgeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Conocimiento Financiero</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu nivel actual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Esto nos ayuda a adaptar el contenido para ti.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tus Metas Financieras</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Ahorrar para mi primer auto, pagar mis deudas, aprender a invertir..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe qué te gustaría lograr.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Contexto Financiero</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Soy estudiante y no tengo ingresos fijos, trabajo a tiempo completo y quiero empezar a ahorrar..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Danos un poco de información sobre tu situación actual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  'Crear mi Ruta de Aprendizaje'
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
            Estamos creando tu plan de estudios...
          </p>
        </div>
      )}

      {learningPath && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-headline text-center">
            ¡Aquí está tu ruta!
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="text-primary" />
                <span>Módulos de Aprendizaje</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {learningPath.learningPath.map((module, moduleIndex) => (
                  <AccordionItem value={`item-${moduleIndex}`} key={moduleIndex}>
                    <AccordionTrigger className="font-headline text-lg">
                      {module.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 pl-6 list-none">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lessonIndex} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}