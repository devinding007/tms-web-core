import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import PersonnelView from '@/views/PersonnelView.vue';
import SkillView from '@/views/SkillView.vue';
import QuestionView from '@/views/QuestionView.vue';
import ExamPaperView from '@/views/ExamPaperView.vue';
import ExamRunView from '@/views/ExamRunView.vue';
import ExamExecutionView from '@/views/ExamExecutionView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardView },
    { path: '/personnel', component: PersonnelView },
    { path: '/skill', component: SkillView },
    { path: '/questions', component: QuestionView },
    { path: '/exam-papers', component: ExamPaperView },
    { path: '/exam-runs', component: ExamRunView },
    { path: '/exam-session', component: ExamExecutionView },
  ],
});
