import { useEffect } from "react";
import { toast } from "sonner";
import { useRecruit } from "@/contexts/RecruitContext";
import { positions, tags, types } from "@/lib/utils";
import { useInitializeCheckboxes } from "@/hooks/useInitializeCheckboxes";
import { useLimitWarning } from "@/hooks/useLimitWarning";
import { useUpdateURLParams } from "@/hooks/useUpdateURLParams";
import { useFilterOperators } from "@/hooks/useFilterOperators";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import type { Operator } from "@/types/recruit";

export default function CheckboxArea() {
  const { recruitData, isLoading } = useRecruit();
  const {
    checkedItems,
    setCheckedItems,
    selectedItems,
    setSelectedItems,
    selectedCount,
    setSelectedCount,
  } = useInitializeCheckboxes();

  const filteredOperators = useFilterOperators(recruitData, selectedItems);

  useLimitWarning(selectedCount, selectedItems);
  useUpdateURLParams(selectedItems);

  useEffect(() => {
    if (!isLoading) {
      toast.success("データの読み込みが完了しました");
    }
  }, [isLoading]);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: string
  ) => {
    if (e.target.checked) {
      if (selectedCount < 6) {
        setCheckedItems((prev) => ({ ...prev, [item]: true }));
        setSelectedItems((prev) => [...prev, item]);
        setSelectedCount(selectedCount + 1);
      } else {
        toast.warning(
          "タグの選択数が上限になりました。<br>6個まで選択可能です",
          {
            description: `選択中: <b>${selectedItems.join(", ")}</b>`,
          }
        );
      }
    } else {
      setCheckedItems((prev) => ({ ...prev, [item]: false }));
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem !== item)
      );
      setSelectedCount(selectedCount - 1);
    }
  };

  const CheckboxGroup = ({
    title,
    description,
    items,
    prefix,
  }: {
    title: string;
    description: string;
    items: string[];
    prefix: string;
  }) => (
    <>
      <hgroup className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
      </hgroup>
      <div className="mt-2 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="checkbox"
              id={`${prefix}-${index + 1}`}
              className="hidden peer"
              checked={!!checkedItems[item]}
              value={item}
              onChange={(e) => handleCheckboxChange(e, item)}
            />
            <label
              htmlFor={`${prefix}-${index + 1}`}
              className="select-none cursor-pointer w-full flex items-center justify-center rounded-lg border-2 border-gray-200 py-3 px-6 font-bold text-gray-700 transition-colors duration-200 ease-in-out peer-checked:bg-gray-200 peer-checked:text-gray-900 peer-checked:border-gray-200"
            >
              <span>{item}</span>
            </label>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      <CheckboxGroup
        title="Type"
        description="職分"
        items={types}
        prefix="type"
      />
      <CheckboxGroup
        title="Position"
        description="位置"
        items={positions}
        prefix="position"
      />
      <CheckboxGroup title="Tag" description="タグ" items={tags} prefix="tag" />

      {/* 選択されたタグの表示 */}
      <div className="mt-6">
        <h3 className="text-xl font-bold">選択されたタグ:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedItems.map((item) => (
            <span
              key={item}
              className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* フィルタリングされたオペレーターの表示 */}
      <div className="grid mt-6 gap-6">
        {Object.entries(filteredOperators).map(([combination, operators]) => (
          <div key={combination}>
            <h3 className="text-xl font-bold">{combination}</h3>
            <ul className="flex flex-wrap mt-2 gap-1">
              {(operators as Operator[]).map((operator) => (
                <li key={operator.id}>
                  <a
                    href={operator.wiki}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Avatar>
                      <AvatarImage alt={operator.name} src={operator.imgPath} />
                      <AvatarFallback>{operator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
