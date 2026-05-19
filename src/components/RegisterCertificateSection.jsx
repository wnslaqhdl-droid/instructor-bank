export default function RegisterCertificateSection({
  certificates,
  setCertificates,

  emptyCertificate,

  Field,
  Repeater,
  clone,

  MonthSelect,

  toMonthValue,
  monthToDate
}) {

  function updateCertificate(
    index,
    key,
    value
  ) {

    setCertificates(current =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value
            }
          : item
      )
    );
  }

  return (

    <section className="card">

      <h2>
        자격증 정보
      </h2>

      <Repeater
        items={certificates}
        setItems={setCertificates}
        emptyItem={emptyCertificate}
        clone={clone}
      >

        {(item, index)=>(

          <>

            <Field label="자격증명">

              <input
                value={
                  item.certificate_name
                }

                onChange={(e)=>
                  updateCertificate(
                    index,
                    "certificate_name",
                    e.target.value
                  )
                }

                placeholder="
사회복지사 1급"
              />

            </Field>

            <Field label="발급기관">

              <input
                value={item.issuer}

                onChange={(e)=>
                  updateCertificate(
                    index,
                    "issuer",
                    e.target.value
                  )
                }

                placeholder="
보건복지부"
              />

            </Field>

            <Field label="취득일">

              <MonthSelect
                value={toMonthValue(
                  item.acquired_date
                )}

                onChange={(value)=>
                  updateCertificate(
                    index,
                    "acquired_date",
                    monthToDate(value)
                  )
                }
              />

            </Field>

            <Field label="만료일">

              <MonthSelect
                value={toMonthValue(
                  item.expire_date
                )}

                onChange={(value)=>
                  updateCertificate(
                    index,
                    "expire_date",
                    monthToDate(value)
                  )
                }
              />

            </Field>

            <Field label="공개 여부">

              <label
                style={{
                  display:"flex",
                  gap:"8px",
                  alignItems:"center"
                }}
              >

                <input
                  type="checkbox"

                  checked={
                    item.is_public
                  }

                  onChange={(e)=>
                    updateCertificate(
                      index,
                      "is_public",
                      e.target.checked
                    )
                  }
                />

                공개

              </label>

            </Field>

          </>

        )}

      </Repeater>

    </section>
  );
}
