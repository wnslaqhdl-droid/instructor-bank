export default function SearchFilters({
  keyword,
  setKeyword,
  region,
  setRegion,
  target,
  setTarget,
  type,
  setType,
  specialty,
  setSpecialty,
  sortType,
  setSortType,
  onlyVerified,
  setOnlyVerified,
  regionOptions,
  targetOptions,
  typeOptions,
  specialtyOptions,
  Field,
}) {

  return (
    <section className="card">

      <div className="grid grid-4">

        <Field label="키워드">
          <input
            value={keyword}
            onChange={(e)=>
              setKeyword(e.target.value)
            }
            placeholder="이름, 주제, 소개 검색"
          />
        </Field>

        <Field label="지역">
          <select
            value={region}
            onChange={(e)=>
              setRegion(e.target.value)
            }
          >
            <option value="">전체</option>

            {regionOptions.map((r)=>(
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="교육대상">
          <select
            value={target}
            onChange={(e)=>
              setTarget(e.target.value)
            }
          >
            <option value="">전체</option>

            {targetOptions.map((r)=>(
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="교육유형">
          <select
            value={type}
            onChange={(e)=>
              setType(e.target.value)
            }
          >
            <option value="">전체</option>

            {typeOptions.map((r)=>(
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

      </div>

      <div
        className="grid grid-3"
        style={{marginTop:14}}
      >

        <Field label="강의 분야">
          <select
            value={specialty}
            onChange={(e)=>
              setSpecialty(e.target.value)
            }
          >
            <option value="">전체</option>

            {specialtyOptions.map((r)=>(
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="정렬">
          <select
            value={sortType}
            onChange={(e)=>
              setSortType(e.target.value)
            }
          >
            <option value="latest">
              최신순
            </option>

            <option value="name">
              이름순
            </option>

            <option value="region">
              지역순
            </option>

          </select>
        </Field>

        <label
          style={{
            display:"block",
            marginTop:8
          }}
        >
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e)=>
              setOnlyVerified(
                e.target.checked
              )
            }
          />

          <span style={{marginLeft:6}}>
            개발원 과정 수료자만 보기
          </span>

        </label>

        <div
          style={{
            display:"flex",
            alignItems:"end",
            justifyContent:"flex-end"
          }}
        >
          <button
            className="btn"
            onClick={()=>{
              setKeyword("");
              setRegion("");
              setTarget("");
              setType("");
              setSpecialty("");
              setOnlyVerified(false);
              setSortType("latest");
            }}
          >
            필터 초기화
          </button>
        </div>

      </div>

    </section>
  );
}
