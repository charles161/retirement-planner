import { Suspense } from 'react';
import { InputForm } from './components/input-form/InputForm';
import { ResultsDisplay } from './components/results-display/ResultsDisplay';
import { Charts } from './components/charts/Charts';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';

export default function RetirementPlannerPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        Retirement Planner
      </h1>
      <Separator className="mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <Card className="shadow-lg h-full bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <Suspense fallback={<div>Loading form...</div>}>
                <InputForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div className="w-full h-full lg:w-3/4">
          <Card className="shadow-lg h-full">
            <CardContent className="p-6">
              <Tabs defaultValue="results" className="w-full">
                <TabsList className="w-full max-w-md mx-auto mb-8">
                  <TabsTrigger value="results" className="w-1/2">Results</TabsTrigger>
                  <TabsTrigger value="charts" className="w-1/2">Charts</TabsTrigger>
                </TabsList>
                <TabsContent value="results">
                  <Suspense fallback={<div className="text-center">Loading results...</div>}>
                    <ResultsDisplay />
                  </Suspense>
                </TabsContent>
                <TabsContent value="charts">
                  <Suspense fallback={<div className="text-center">Loading charts...</div>}>
                    <Charts />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
