'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Goal, PlusCircle, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, where, query } from 'firebase/firestore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const budgetSchema = z.object({
  income: z.coerce.number().min(0, 'El ingreso debe ser positivo.'),
  expenses: z.array(
    z.object({
      name: z.string().min(1, 'El nombre es requerido.'),
      amount: z.coerce.number().min(1, 'El monto debe ser mayor a 0.'),
    })
  ),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const goalSchema = z.object({
  name: z.string().min(1, 'El nombre de la meta es requerido.'),
  targetAmount: z.coerce.number().min(1, 'El objetivo debe ser mayor a 0.'),
  savedAmount: z.coerce.number().min(0, 'Lo ahorrado debe ser positivo.'),
});

type GoalData = z.infer<typeof goalSchema>;
type GoalDocument = GoalData & { id: string };

export default function GoalsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const goalsCollection = useMemoFirebase(() => user && firestore && collection(firestore, 'users', user.uid, 'goals'), [firestore, user]);
  const { data: goals = [] } = useCollection<GoalDocument>(goalsCollection);
  
  const budgetCollection = useMemoFirebase(() => user && firestore && collection(firestore, 'users', user.uid, 'budgets'), [firestore, user]);
  const { data: budgetData } = useCollection<BudgetFormValues & { id: string }>(budgetCollection);
  const userBudget = budgetData?.[0];

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      income: 5000,
      expenses: [
        { name: 'Renta', amount: 1500 },
        { name: 'Comida', amount: 600 },
        { name: 'Transporte', amount: 300 },
        { name: 'Entretenimiento', amount: 400 },
      ],
    },
  });

  useEffect(() => {
    if (userBudget) {
      form.reset(userBudget);
    }
  }, [userBudget, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'expenses',
  });

  const watchAllFields = form.watch();
  const totalExpenses = watchAllFields.expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);
  const remainingBalance = watchAllFields.income - totalExpenses;
  
  useEffect(() => {
    if(user && firestore && form.formState.isDirty) {
        const budgetDocRef = userBudget ? doc(firestore, 'users', user.uid, 'budgets', userBudget.id) : doc(collection(firestore, 'users', user.uid, 'budgets'));
        setDocumentNonBlocking(budgetDocRef, { ...watchAllFields, userId: user.uid }, { merge: true });
    }
  }, [watchAllFields, user, firestore, userBudget, form.formState.isDirty]);


  const goalForm = useForm<GoalData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', targetAmount: 1000, savedAmount: 0 },
  });

  const onAddGoal: SubmitHandler<GoalData> = (data) => {
    if (!goalsCollection) return;
    addDocumentNonBlocking(goalsCollection, { ...data, userId: user?.uid });
    goalForm.reset();
  };
  
  const removeGoal = (id: string) => {
    if (!user || !firestore) return;
    const goalDocRef = doc(firestore, 'users', user.uid, 'goals', id);
    deleteDocumentNonBlocking(goalDocRef);
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Metas y Presupuesto</h1>
        <p className="mt-2 text-muted-foreground">
          Visualiza tu presupuesto, planifica tus gastos y define tus metas financieras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Presupuesto</CardTitle>
              <CardDescription>Ajusta tus ingresos y gastos para ver la distribución.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingreso Mensual (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="mb-2 font-medium">Categorías de Gastos</h3>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                           <FormField
                            control={form.control}
                            name={`expenses.${index}.name`}
                            render={({ field }) => (
                               <Input placeholder="Nombre del gasto" {...field} className="flex-1" />
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`expenses.${index}.amount`}
                            render={({ field }) => (
                               <Input type="number" placeholder="Monto" {...field} className="w-32" />
                            )}
                          />
                          <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: '', amount: 0 })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Gasto
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Mis Metas Financieras</CardTitle>
              <CardDescription>Añade y sigue el progreso de tus metas de ahorro.</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...goalForm}>
                 <form onSubmit={goalForm.handleSubmit(onAddGoal)} className="flex items-end gap-4 mb-6">
                   <FormField
                    control={goalForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nombre de la Meta</FormLabel>
                        <FormControl>
                          <Input placeholder="Ahorrar para vacaciones" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={goalForm.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Objetivo</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={goalForm.control}
                    name="savedAmount"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Ahorrado</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="icon"><Goal className="h-4 w-4" /></Button>
                 </form>
               </Form>
               <Separator className="my-4" />
               <div className="space-y-4">
                 {(goals ?? []).length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground">Aún no has añadido ninguna meta.</p>
                 ) : (goals ?? []).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{goal.name}</span>
                             <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)}>
                                <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                        </div>
                       <Progress value={(goal.savedAmount / goal.targetAmount) * 100} />
                       <p className="text-sm text-muted-foreground text-right">
                         ${goal.savedAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                       </p>
                    </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Visualización del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={watchAllFields.expenses}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: $${entry.amount}`}
                    >
                      {watchAllFields.expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4 text-lg">
                 <div className="flex justify-between">
                    <span>Ingreso Total:</span>
                    <span className="font-bold text-green-600">+ ${watchAllFields.income.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Gasto Total:</span>
                    <span className="font-bold text-red-600">- ${totalExpenses.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between border-t pt-4 mt-4">
                    <span className="font-headline">Balance Restante:</span>
                    <span className={`font-bold ${remainingBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      ${remainingBalance.toLocaleString()}
                    </span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    