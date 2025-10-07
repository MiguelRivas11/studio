
'use client';

import { useState, useMemo } from 'react';
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
  type PersonalizedLearningPathInput,
} from '@/ai/flows/personalized-learning-paths';
import { CheckCircle2, Loader2, School, Trash2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

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

interface LearningPathDocument {
  id: string;
  name: string;
  description: string;
  startDate: any;
  modules: {
      id: string;
      title: string;
      order: number;
      lessons: {
          id: string;
          title: string;
          order: number;
      }[];
  }[];
}


export default function LearnPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const learningPathCollectionRef = useMemoFirebase(() => 
    user && firestore ? collection(firestore, 'users', user.uid, 'learningPaths') : null
  , [firestore, user]);

  const { data: learningPaths, isLoading: isLoadingPaths } = useCollection<LearningPathDocument>(learningPathCollectionRef);
  const activeLearningPath = useMemo(() => learningPaths?.[0], [learningPaths]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialGoals: '',
      financialBackground: '',
    },
  });

  async function onSubmit(values: PersonalizedLearningPathInput) {
    if (!firestore || !user) return;
    setIsLoading(true);
    
    try {
      const result = await generatePersonalizedLearningPath(values);
      const batch = writeBatch(firestore);

      // Create LearningPath
      const learningPathRef = doc(collection(firestore, 'users', user.uid, 'learningPaths'));
      batch.set(learningPathRef, {
        userId: user.uid,
        name: `Ruta de aprendizaje para ${values.currentKnowledgeLevel}`,
        description: `Metas: ${values.financialGoals}`,
        startDate: serverTimestamp(),
      });

      // Create Modules and Lessons
      result.learningPath.forEach((module, moduleIndex) => {
        const moduleRef = doc(collection(firestore, learningPathRef.path, 'modules'));
        batch.set(moduleRef, {
          learningPathId: learningPathRef.id,
          title: module.title,
          description: `Módulo ${moduleIndex + 1}`,
          order: moduleIndex,
        });

        module.lessons.forEach((lessonTitle, lessonIndex) => {
          const lessonRef = doc(collection(firestore, moduleRef.path, 'lessons'));
          batch.set(lessonRef, {
            moduleId: moduleRef.id,
            title: lessonTitle,
            content: 'Contenido de la lección pendiente.',
            order: lessonIndex,
          });
        });
      });
      
      await batch.commit();

    } catch (error) {
      console.error('Error generating or saving learning path:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteLearningPath() {
    if (!firestore || !user || !activeLearningPath) return;
    // For simplicity, we are deleting the path doc, but not subcollections.
    // In a real app, you'd want to recursively delete modules/lessons.
    const pathRef = doc(firestore, 'users', user.uid, 'learningPaths', activeLearningPath.id);
    deleteDocumentNonBlocking(pathRef);
  }

  if (isLoadingPaths) {
    return (
       <div className="flex justify-center items-center h-full p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (activeLearningPath && !isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">
            ¡Aquí está tu ruta!
            </h1>
            <p className="mt-2 text-muted-foreground">{activeLearningPath.name}</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <School className="text-primary" />
                        <span>Módulos de Aprendizaje</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={deleteLearningPath}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Crear Nueva Ruta
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {activeLearningPath.modules.sort((a, b) => a.order - b.order).map((module) => (
                    <AccordionItem value={`item-${module.id}`} key={module.id}>
                        <AccordionTrigger className="font-headline text-lg">
                        {module.title}
                        </AccordionTrigger>
                        <AccordionContent>
                        <ul className="space-y-3 pl-6 list-none">
                            {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                            <li key={lesson.id} className="flex items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span>{lesson.title}</span>
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
    )
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
    </div>
  );
}

