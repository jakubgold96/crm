import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userRoleLabels } from '@/lib/enums';
import { requireUser } from '@/lib/auth';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const { profile, email } = await requireUser();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Twój profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dane konta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">E-mail</dt>
              <dd className="mt-0.5 text-foreground">{email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Rola</dt>
              <dd className="mt-0.5 text-foreground">{userRoleLabels[profile.role]}</dd>
            </div>
          </dl>
          <p className="text-xs text-foreground-muted">
            Rolę i uprawnienia może zmienić tylko administrator (Ustawienia → Użytkownicy).
          </p>
          <ProfileForm fullName={profile.full_name} />
        </CardContent>
      </Card>
    </div>
  );
}
