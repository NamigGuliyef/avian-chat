import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { QAResult, CSMUser } from '@/types/csm';

interface QAResultsProps {
  results: QAResult[];
  users: CSMUser[];
  currentUserId?: string;
  userRole: 'agent' | 'supervisor' | 'admin';
}

const QAResults: React.FC<QAResultsProps> = ({
  results,
  users,
  currentUserId,
  userRole,
}) => {
  // Filter results based on role
  const filteredResults = userRole === 'agent' 
    ? results.filter(r => r.agentId === currentUserId)
    : results;

  // Calculate averages
  const avgCallScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.callScore, 0) / filteredResults.length)
    : 0;
  const avgWritingScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.writingScore, 0) / filteredResults.length)
    : 0;
  const avgOverallScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.overallScore, 0) / filteredResults.length)
    : 0;

  // Worst cases
  const worstCases = [...filteredResults]
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QA Results</h1>
        <p className="text-muted-foreground">Keyfiyyət dəyərləndirmə nəticələri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Score Overview */}
        <div className="space-y-4">
          {/* Call Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Zəng üzrə QA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={cn("text-4xl font-bold", getScoreColor(avgCallScore))}>
                  {avgCallScore}%
                </span>
              </div>
              <Progress value={avgCallScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Writing Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Yazı üzrə QA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={cn("text-4xl font-bold", getScoreColor(avgWritingScore))}>
                  {avgWritingScore}%
                </span>
              </div>
              <Progress value={avgWritingScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ümumi QA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={cn("text-4xl font-bold", getScoreColor(avgOverallScore))}>
                  {avgOverallScore}%
                </span>
              </div>
              <Progress value={avgOverallScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Worst Cases */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Ən pis case-lər</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {worstCases.map((qa) => (
                  <div key={qa.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <div>
                      <p className="text-sm font-medium">{qa.agentName}</p>
                      <p className="text-xs text-muted-foreground">{qa.ticketId}</p>
                    </div>
                    <Badge variant="destructive">{qa.overallScore}%</Badge>
                  </div>
                ))}
                {worstCases.length === 0 && (
                  <p className="text-sm text-muted-foreground">Heç bir nəticə yoxdur</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Results List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">QA Nəticələri</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredResults.map((qa) => (
                    <div 
                      key={qa.id} 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {qa.agentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{qa.agentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {qa.ticketId} • {formatDate(qa.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={cn(getScoreBg(qa.overallScore), getScoreColor(qa.overallScore))}>
                          {qa.overallScore}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Zəng</p>
                          <p className={cn("font-semibold", getScoreColor(qa.callScore))}>
                            {qa.callScore}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Yazı</p>
                          <p className={cn("font-semibold", getScoreColor(qa.writingScore))}>
                            {qa.writingScore}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ümumi</p>
                          <p className={cn("font-semibold", getScoreColor(qa.overallScore))}>
                            {qa.overallScore}%
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">Rəy:</p>
                        <p className="text-sm">{qa.feedback}</p>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        Dəyərləndirən: {users.find(u => u.id === qa.evaluatedBy)?.name || qa.evaluatedBy}
                      </p>
                    </div>
                  ))}
                  {filteredResults.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Heç bir QA nəticəsi tapılmadı
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QAResults;
