import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceFormSchema, type ServiceForm } from '@/validation/schemas';
import CurrencyInput from '@/components/ui/CurrencyInput';

export default function ServiceForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  initialValues?: Partial<ServiceForm>;
  onSubmit: (values: ServiceForm) => void;
  onCancel?: () => void;
  submitting?: boolean;
}) {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      name: '',
      duration_minutes: 30,
      price_cents: 0,
      description: '',
      ...initialValues,
    },
  });

  const submit = (values: ServiceForm) => onSubmit(values);

  return (
    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
      <div>
        <label htmlFor="name" className="block text-sm">Nome</label>
        <input id="name" className="border p-2 rounded w-full" {...register('name')} />
        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm">Duração (min)</label>
        <input id="duration" type="number" className="border p-2 rounded w-full" {...register('duration_minutes', { valueAsNumber: true })} />
        {errors.duration_minutes && <p className="text-red-600 text-xs mt-1">{errors.duration_minutes.message}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm">Preço</label>
        <Controller
          control={control}
          name="price_cents"
          render={({ field }) => (
            <CurrencyInput id="price" className="border p-2 rounded w-full" value={field.value} onChange={(v)=>field.onChange(v)} />
          )}
        />
        {errors.price_cents && <p className="text-red-600 text-xs mt-1">{errors.price_cents.message}</p>}
      </div>
      <div>
        <label htmlFor="desc" className="block text-sm">Descrição</label>
        <input id="desc" className="border p-2 rounded w-full" {...register('description')} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting || isSubmitting}>Salvar</button>
        {onCancel && <button type="button" className="px-3 py-2 border rounded" onClick={() => { reset(); onCancel(); }}>Cancelar</button>}
      </div>
    </form>
  );
}
