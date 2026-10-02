import SubjectLabClient from '../../../components/subjects/SubjectLabClient';
import { SUBJECTS_CATALOG, getSubjectById } from '../../../content/courses/subjects';

export async function generateMetadata({ params }) {
  const resolved = await params;
  const subj = getSubjectById(resolved.id);

  return {
    title: `${subj.code}: ${subj.shortTitle} | The Teardown Lab`,
    description: subj.description,
  };
}

export default async function SubjectPage({ params }) {
  const resolvedParams = await params;
  return <SubjectLabClient subjectId={resolvedParams.id} />;
}
