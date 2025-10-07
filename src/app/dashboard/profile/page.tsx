'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpen, DollarSign, ShieldCheck, Star, Target } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

interface Budget {
  id: string;
  income: number;
  expenses: { name: string; amount: number }[];
}

interface LearningPath {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('');
  };

  const goalsCollection = useMemoFirebase(() => user && firestore && collection(firestore, 'users', user.uid, 'goals'), [firestore, user]);
  const { data: goals = [] } = useCollection<Goal>(goalsCollection);

  const budgetCollection = useMemoFirebase(() => user && firestore && collection(firestore, 'users', user.uid, 'budgets'), [firestore, user]);
  const { data: budgets = [] } = useCollection<Budget>(budgetCollection);
  const budget = budgets?.[0];
  
  const learningPathCollection = useMemoFirebase(() => user && firestore && collection(firestore, 'users', user.uid, 'learningPaths'), [firestore, user]);
  const { data: learningPaths = [] } = useCollection<LearningPath>(learningPathCollection);
  const learningPath = learningPaths?.[0];

  const totalExpenses = budget?.expenses.reduce((acc, expense) => acc + expense.amount, 0) ?? 0;
  const remainingBalance = (budget?.income ?? 0) - totalExpenses;
  const totalGoals = goals?.length ?? 0;
  const completedGoals = goals?.filter(g => g.savedAmount >= g.targetAmount).length ?? 0;

  const achievements = [
    { name: 'Primer Ahorro', icon: Award, unlocked: true },
    { name: 'Lección Completa', icon: Star, unlocked: true },
    { name: 'Presupuesto Creado', icon: ShieldCheck, unlocked: !!budget },
    { name: 'Meta Alcanzada', icon: Target, unlocked: completedGoals > 0 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary">
             {user?.photoURL ? <AvatarImage src={user.photoURL} alt="User avatar" /> : userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User avatar" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback className="text-3xl">{user ? getInitials(user.displayName || user.email) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{user?.displayName || user?.email}</h1>
            <p className="mt-1 text-muted-foreground">Miembro desde {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'hace poco'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <DollarSign className="text-primary"/>
                        Resumen Financiero
                    </CardTitle>
                    <CardDescription>Una vista rápida de tu estado financiero actual.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Ingreso Mensual</p>
                        <p className="text-2xl font-bold">${budget?.income?.toLocaleString() ?? 0}</p>
                    </div>
                     <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Gasto Mensual</p>
                        <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                    </div>
                     <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Balance Restante</p>
                        <p className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>${remainingBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Metas Activas</p>
                        <p className="text-2xl font-bold">{totalGoals}</p>
                    </div>
                     <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Metas Cumplidas</p>
                        <p className="text-2xl font-bold">{completedGoals}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <BookOpen className="text-primary"/>
                        Progreso de Aprendizaje
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningPath ? (
                    <>
                      <p className="font-medium">{learningPath.name}</p>
                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Progreso General del Curso</span>
                              <span className="text-sm text-muted-foreground">45%</span>
                          </div>
                          <Progress value={45} aria-label="45% de progreso en el curso" />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Aún no has iniciado una ruta de aprendizaje.</p>
                  )}
                </CardContent>
            </Card>
        </div>

        {/* Achievements */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Logros</CardTitle>
                <CardDescription>Tus insignias ganadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {achievements.map((ach) => (
                        <div key={ach.name} className={`flex flex-col items-center gap-2 text-center p-4 rounded-lg ${!ach.unlocked && 'opacity-40'}`}>
                            <div className={`p-3 rounded-full ${ach.unlocked ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                                <ach.icon className="w-10 h-10" />
                            </div>
                            <Badge variant={ach.unlocked ? 'secondary' : 'outline'} className="text-center">{ach.name}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
