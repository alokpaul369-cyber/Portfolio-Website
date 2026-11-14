import { createElement, useMemo } from 'react';
import { Plus, Wrench } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import RowActions from '@/components/admin/RowActions';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import { skillCategories } from '@/data/skills';
import useApiQuery from '@/hooks/useApiQuery';
import useDeleteConfirm from '@/hooks/useDeleteConfirm';
import { getSkillIcon } from '@/lib/skillIcons';

/** Admin list of skills, grouped by category in display order. */
export default function AdminSkills() {
  const { data: skills, isLoading, error, retry } = useApiQuery('/skills');
  const deletion = useDeleteConfirm({
    path: (s) => `/skills/${s.id}`,
    label: 'Skill',
    onDeleted: retry,
  });

  const groups = useMemo(
    () =>
      skillCategories
        .map((category) => ({
          ...category,
          items: (skills ?? []).filter((s) => s.category === category.key),
        }))
        .filter((group) => group.items.length > 0),
    [skills],
  );

  const newButton = (
    <Button size="sm" to="/admin/skills/new">
      <Plus className="size-4" aria-hidden="true" />
      New skill
    </Button>
  );

  return (
    <>
      <AdminPageHeader
        title="Skills"
        description="Shown on the Skills page, grouped by category."
        actions={newButton}
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton rows={6} />}
      {!isLoading && !error && skills.length === 0 && (
        <EmptyState Icon={Wrench} title="No skills yet" action={newButton} />
      )}

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
              {group.label} <span className="text-muted/70">({group.items.length})</span>
            </h2>
            <AdminTable caption={`${group.label} skills`}>
              <thead>
                <tr>
                  <Th>Skill</Th>
                  <Th>Level</Th>
                  <Th>Order</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((skill) => (
                  <tr key={skill.id} className="last:[&>td]:border-b-0">
                    <Td>
                      <span className="flex items-center gap-3 font-medium">
                        {createElement(getSkillIcon(skill.icon), {
                          className: 'size-4 text-muted',
                          'aria-hidden': true,
                        })}
                        {skill.name}
                      </span>
                    </Td>
                    <Td className="text-muted capitalize">{skill.level}</Td>
                    <Td className="text-xs text-muted">{skill.order}</Td>
                    <Td>
                      <RowActions
                        name={skill.name}
                        editTo={`/admin/skills/${skill.id}`}
                        onDelete={() => deletion.request(skill)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deletion.target)}
        title="Delete skill?"
        description={`"${deletion.target?.name}" will be removed from the Skills section. This cannot be undone.`}
        busy={deletion.busy}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </>
  );
}
